'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import * as Ably from 'ably';
import { GameState, Player, Feedback } from '@/types/game';

interface GameContextType {
  gameState: GameState;
  connectionStatus: 'connecting' | 'connected' | 'failed' | 'disconnected';
  createRoom: (name: string, uid: string, secret: number, min: number, max: number) => Promise<string>;
  joinRoom: (code: string, uid: string) => Promise<void>;
  completeGuestSetup: (name: string, uid: string, secret: number) => Promise<void>;
  makeGuess: (guess: number) => Feedback;
  resetGame: () => void;
  startNewGame: () => void;
  startGame: () => void;
  startWithAI: (uid: string) => void;
}

const initialPlayer = (name: string = '', uid: string = '', secretNumber: number = 0): Player => ({
  name,
  uid,
  secretNumber,
  attempts: 0,
  history: [],
});

const initialState: GameState = {
  player1: initialPlayer('Player 1'),
  player2: initialPlayer('Player 2'),
  range: { min: 1, max: 100 },
  currentTurn: 'player1',
  status: 'setup',
  winner: null,
  roomCode: null,
  playerId: null,
  isOpponentPresent: false,
  isPlayer1Ready: false,
  isPlayer2Ready: false,
  turnTimeLeft: 30,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const ABLY_KEY = process.env.NEXT_PUBLIC_ABLY_API_KEY;

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed' | 'disconnected'>('connecting');
  
  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const latestStateRef = useRef<GameState>(gameState);

  // Sync ref with state
  useEffect(() => {
    latestStateRef.current = gameState;
  }, [gameState]);

  // Initialize Ably
  useEffect(() => {
    if (ABLY_KEY && ABLY_KEY !== 'your_ably_api_key_here') {
      const ably = new Ably.Realtime({ 
        key: ABLY_KEY,
        clientId: `user-${Math.random().toString(36).substring(2, 8)}`
      });
      
      ablyRef.current = ably;

      ably.connection.on('connected', () => setConnectionStatus('connected'));
      ably.connection.on('failed', () => setConnectionStatus('failed'));
      ably.connection.on('disconnected', () => setConnectionStatus('disconnected'));
    } else {
      setTimeout(() => setConnectionStatus('failed'), 0);
    }

    return () => {
      ablyRef.current?.close();
    };
  }, []);


  const updateState = useCallback((updater: GameState | ((prev: GameState) => GameState)) => {
    setGameState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      latestStateRef.current = next;
      return next;
    });
  }, []);

  // ---------------------------------------------------------
  // THE ULTIMATE "DUAL-HEARTBEAT" SYNC SYSTEM (No Presence API)
  // ---------------------------------------------------------
  useEffect(() => {
    const channel = channelRef.current;
    if (!channel) return;

    const interval = setInterval(() => {
      const state = latestStateRef.current;
      
      // Host pulses to help Guests
      if (state.playerId === 'player1' && state.status === 'lobby') {
        const payload = {
          name: state.player1.name,
          uid: state.player1.uid,
          secret: state.player1.secretNumber,
          range: state.range,
          isReady: state.isPlayer1Ready,
        };
        channel.publish('host-heartbeat', payload);
      }
      
      // Guest pulses to help Hosts (Even during guest-setup, helps host know they are there)
      if (state.playerId === 'player2' && (state.status === 'guest-setup' || state.status === 'lobby')) {
        const payload = {
          name: state.player2.name || 'Challenger Joining...',
          uid: state.player2.uid,
          secret: state.player2.secretNumber,
          isReady: state.isPlayer2Ready,
        };
        channel.publish('guest-heartbeat', payload);
      }
    }, 2500); // Fast 2.5s pulse for near-instant sync

    return () => clearInterval(interval);
  }, [gameState.status, gameState.playerId]); // Re-bind if major phase changes


  const createRoom = useCallback(async (name: string, uid: string, secret: number, min: number, max: number) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newState: GameState = { 
      ...initialState, 
      roomCode: code, 
      playerId: 'player1', 
      status: 'lobby',
      player1: initialPlayer(name, uid, secret),
      range: { min, max },
      isPlayer1Ready: true,
      isOpponentPresent: false,
    };
    
    latestStateRef.current = newState;
    setGameState(newState);
    
    if (ablyRef.current) {
      const channel = ablyRef.current.channels.get(`room-${code}`);
      channelRef.current = channel;

      // Host Listens for Guest Heartbeats
      channel.subscribe('guest-heartbeat', (msg) => {
        if (msg.clientId !== ablyRef.current?.clientId) {
          const payload = msg.data;
          updateState(prev => ({
            ...prev,
            isOpponentPresent: true,
            player2: { 
              ...prev.player2, 
              // Don't overwrite empty guest name with placeholder if they actually became ready later
              name: payload.name.includes('...') && prev.isPlayer2Ready ? prev.player2.name : payload.name, 
              uid: payload.uid || prev.player2.uid,
              secretNumber: payload.secret 
            },
            isPlayer2Ready: payload.isReady,
          }));
        }
      });

      // Subscribe to actions
      channel.subscribe('start-duel', () => {
        updateState(prev => ({ ...prev, status: 'playing' }));
      });

      channel.subscribe('rematch', () => {
        updateState(prev => ({
          ...initialState,
          roomCode: prev.roomCode,
          playerId: prev.playerId,
          status: 'lobby', // Host goes back to lobby/setup
          player1: { ...initialPlayer(prev.player1.name, prev.player1.uid), attempts: 0, history: [] },
          player2: { ...initialPlayer(prev.player2.name, prev.player2.uid), attempts: 0, history: [] },
          isPlayer1Ready: false,
          isPlayer2Ready: false,
        }));
      });

      channel.subscribe('guess-made', (msg) => {
        if (msg.clientId !== ablyRef.current?.clientId) {
          const { guess, feedback, nextTurn, isWinner } = msg.data;
          updateState(prev => {
            const currentPlayerKey = prev.currentTurn;
            return {
              ...prev,
              [currentPlayerKey]: {
                ...prev[currentPlayerKey],
                attempts: prev[currentPlayerKey].attempts + 1,
                history: [{ guess, feedback }, ...prev[currentPlayerKey].history],
              },
              currentTurn: nextTurn as 'player1' | 'player2',
              status: isWinner ? 'finished' : 'playing',
              winner: isWinner ? currentPlayerKey : null,
            };
          });
        }
      });
    }
    return code;
  }, [updateState]);

  const joinRoom = useCallback(async (code: string, uid: string) => {
    const newState: GameState = { 
      ...initialState, 
      roomCode: code, 
      playerId: 'player2', 
      status: 'guest-setup', 
      isOpponentPresent: true // We assume the host is there if we have a code
    };
    // Initialize guest with uid early
    newState.player2.uid = uid;
    latestStateRef.current = newState;
    setGameState(newState);
    
    if (ablyRef.current) {
      const channel = ablyRef.current.channels.get(`room-${code}`);
      channelRef.current = channel;

      // Guest Listens for Host Heartbeats
      channel.subscribe('host-heartbeat', (msg) => {
        if (msg.clientId !== ablyRef.current?.clientId) {
          const payload = msg.data;
          updateState(prev => ({
            ...prev,
            isOpponentPresent: true,
            player1: { ...prev.player1, name: payload.name, uid: payload.uid || prev.player1.uid, secretNumber: payload.secret },
            range: payload.range || prev.range,
            isPlayer1Ready: payload.isReady,
          }));
        }
      });

      channel.subscribe('start-duel', () => updateState(prev => ({ ...prev, status: 'playing' })));

      channel.subscribe('rematch', () => {
        updateState(prev => ({
          ...initialState,
          roomCode: prev.roomCode,
          playerId: prev.playerId,
          status: 'guest-setup', // Guest goes back to guest-setup
          player1: { ...initialPlayer(prev.player1.name, prev.player1.uid), attempts: 0, history: [] },
          player2: { ...initialPlayer(prev.player2.name, prev.player2.uid), attempts: 0, history: [] },
          isPlayer1Ready: false,
          isPlayer2Ready: false,
        }));
      });

      channel.subscribe('guess-made', (msg) => {
        if (msg.clientId !== ablyRef.current?.clientId) {
          const { guess, feedback, nextTurn, isWinner } = msg.data;
          updateState(prev => {
            const currentPlayerKey = prev.currentTurn;
            return {
              ...prev,
              [currentPlayerKey]: {
                ...prev[currentPlayerKey],
                attempts: prev[currentPlayerKey].attempts + 1,
                history: [{ guess, feedback }, ...prev[currentPlayerKey].history],
              },
              currentTurn: nextTurn as 'player1' | 'player2',
              status: isWinner ? 'finished' : 'playing',
              winner: isWinner ? currentPlayerKey : null,
            };
          });
        }
      });
      
      // Send an immediate pulse to alert the host we arrived, don't wait 2.5s
      channel.publish('guest-heartbeat', {
        name: 'Challenger Joining...',
        secret: 0,
        isReady: false,
      });
    }
  }, [updateState]);

  const completeGuestSetup = useCallback(async (name: string, uid: string, secret: number) => {
    updateState(prev => ({
      ...prev,
      player2: initialPlayer(name, uid, secret),
      isPlayer2Ready: true,
      status: 'lobby',
    }));

    if (channelRef.current) {
      // Immediate pulse of final Ready state
      channelRef.current.publish('guest-heartbeat', { 
        name, 
        uid,
        secret, 
        isReady: true 
      });
    }
  }, [updateState]);

  const makeGuess = useCallback((guess: number): Feedback => {
    const { player1, player2, currentTurn, status } = latestStateRef.current;
    if (status !== 'playing') return null;

    const opponent = currentTurn === 'player1' ? player2 : player1;
    let feedback: Feedback = 'Correct!';
    if (guess < opponent.secretNumber) feedback = 'Too Low';
    if (guess > opponent.secretNumber) feedback = 'Too High';

    const isWinner = feedback === 'Correct!' || guess === -1; // -1 means timed out but opponent wins? 
    // Wait, the user said: "if the participient did not attempt a guess in the 30 sec then he will lose his attempt and the turn should move to the opponent"
    // So if guess === -1, it's NOT a win, it's just a turn switch.
    
    // BUT, the user also said "and th..." (cut off). usually this means if you timeout 3 times you lose, OR just switch turn.
    // I'll stick to "switch turn" for now as requested.
    
    const actualFeedback = guess === -1 ? 'Time Out' : feedback;
    const nextTurn = isWinner ? currentTurn : (currentTurn === 'player1' ? 'player2' : 'player1');

    updateState(prev => ({
      ...prev,
      [currentTurn]: {
        ...prev[currentTurn],
        attempts: prev[currentTurn].attempts + 1,
        history: [{ guess, feedback: actualFeedback as Feedback }, ...prev[currentTurn].history],
      },
      currentTurn: nextTurn as 'player1' | 'player2',
      status: isWinner ? 'finished' : 'playing',
      winner: isWinner ? currentTurn : null,
      turnTimeLeft: 30, // Reset timer
    }));

    if (channelRef.current) {
      channelRef.current.publish('guess-made', { guess, feedback, nextTurn, isWinner });
    }
    return feedback;
  }, [updateState]);

  // AI Logic: Automated turn when it's AI's turn
  useEffect(() => {
    const { status, currentTurn, player2, range } = gameState;
    
    if (status === 'playing' && currentTurn === 'player2' && player2.isAI) {
        const delay = 1500 + Math.random() * 3000;
        const timer = setTimeout(() => {
          // AI Logic: Smart Binary Search based on its own history
          let currentMin = range.min;
          let currentMax = range.max;
          
          // Analyze history to narrow down his own bounds
          player2.history.forEach(h => {
            if (h.feedback === 'Too Low') {
              currentMin = Math.max(currentMin, h.guess + 1);
            } else if (h.feedback === 'Too High') {
              currentMax = Math.min(currentMax, h.guess - 1);
            }
          });
          
          const guess = Math.floor((currentMin + currentMax) / 2);
          makeGuess(guess);
        }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.status, gameState.currentTurn, gameState.player2.isAI, gameState.range, makeGuess]);

  const startWithAI = useCallback((uid: string) => {
    const { range } = latestStateRef.current;
    
    // Generate AI's secret number
    const aiSecret = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    
    updateState(prev => ({
      ...prev,
      status: 'playing',
      roomCode: `AI-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      player1: { ...prev.player1, uid },
      player2: {
        ...initialPlayer('AI Strategist', 'ai-bot', aiSecret),
        isAI: true,
      },
      isPlayer2Ready: true,
      isOpponentPresent: true,
      turnTimeLeft: 30,
    }));
  }, [updateState]);

  const startGame = useCallback(() => {
    if (latestStateRef.current.playerId === 'player1' && channelRef.current) {
      channelRef.current.publish('start-duel', {});
      updateState(prev => ({ ...prev, status: 'playing' }));
    }
  }, [updateState]);

  const resetGame = useCallback(() => {
    const { playerId, player2, roomCode, player1, range } = latestStateRef.current;
    const isHost = playerId === 'player1';
    const isAI = player2.isAI;
    
    updateState(prev => ({
      ...initialState,
      roomCode: prev.roomCode,
      playerId: prev.playerId,
      range: prev.range,
      status: isAI ? 'playing' : (isHost ? 'lobby' : 'guest-setup'), 
      player1: { ...initialPlayer(prev.player1.name, prev.player1.uid), attempts: 0, history: [] },
      player2: isAI ? { 
        ...initialPlayer('AI Strategist', 'ai-bot', Math.floor(Math.random() * (range.max - range.min + 1)) + range.min), 
        isAI: true, 
      } : { ...initialPlayer(prev.player2.name, prev.player2.uid), attempts: 0, history: [] },
      isPlayer1Ready: isAI || prev.isPlayer1Ready,
      isPlayer2Ready: isAI || prev.isPlayer2Ready,
      isOpponentPresent: isAI || prev.isOpponentPresent,
    }));

    if (channelRef.current && !isAI) {
      channelRef.current.publish('rematch', {});
    }
  }, [updateState]);

  const startNewGame = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    updateState(initialState);
  }, [updateState]);

  // TURN TIMER LOGIC
  useEffect(() => {
    if (gameState.status !== 'playing' || gameState.winner) {
      return;
    }

    const timer = setInterval(() => {
      updateState(prev => {
        if (prev.turnTimeLeft <= 1) {
          return { ...prev, turnTimeLeft: 0 };
        }
        return { ...prev, turnTimeLeft: prev.turnTimeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.status, gameState.winner, updateState]);

  // Handle Turn Skip when timer reaches 0
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.turnTimeLeft === 0 && !gameState.winner) {
      const isMyTurn = gameState.currentTurn === gameState.playerId;
      const isAIMatch = gameState.player2.isAI;
      const isHost = gameState.playerId === 'player1';

      if (isMyTurn || (isAIMatch && isHost && gameState.currentTurn === 'player2')) {
        // Auto-skip turn
        makeGuess(-1); // -1 = TIME OUT
      }
    }
  }, [gameState.turnTimeLeft, gameState.status, gameState.currentTurn, gameState.playerId, gameState.winner, makeGuess]);

  return (
    <GameContext.Provider value={{ 
      gameState, 
      connectionStatus,
      createRoom, 
      joinRoom, 
      completeGuestSetup,
      makeGuess, 
      resetGame,
      startNewGame,
      startGame,
      startWithAI
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
