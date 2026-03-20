'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import * as Ably from 'ably';
import { GameState, Player, Feedback } from '@/types/game';

interface GameContextType {
  gameState: GameState;
  connectionStatus: 'connecting' | 'connected' | 'failed' | 'disconnected';
  createRoom: (name: string, secret: number, min: number, max: number) => Promise<string>;
  joinRoom: (code: string) => Promise<void>;
  completeGuestSetup: (name: string, secret: number) => Promise<void>;
  makeGuess: (guess: number) => Feedback;
  resetGame: () => void;
  startNewGame: () => void;
  startGame: () => void;
}

const initialPlayer = (name: string = '', secretNumber: number = 0): Player => ({
  name,
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
      setConnectionStatus('failed');
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
          secret: state.player2.secretNumber,
          isReady: state.isPlayer2Ready,
        };
        channel.publish('guest-heartbeat', payload);
      }
    }, 2500); // Fast 2.5s pulse for near-instant sync

    return () => clearInterval(interval);
  }, [gameState.status, gameState.playerId]); // Re-bind if major phase changes

  const createRoom = useCallback(async (name: string, secret: number, min: number, max: number) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newState: GameState = { 
      ...initialState, 
      roomCode: code, 
      playerId: 'player1', 
      status: 'lobby',
      player1: initialPlayer(name, secret),
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
              secretNumber: payload.secret 
            },
            isPlayer2Ready: payload.isReady,
          }));
        }
      });

      // Subscribe to actions
      channel.subscribe('start-duel', () => updateState(prev => ({ ...prev, status: 'playing' })));

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

  const joinRoom = useCallback(async (code: string) => {
    const newState: GameState = { 
      ...initialState, 
      roomCode: code, 
      playerId: 'player2', 
      status: 'guest-setup', 
      isOpponentPresent: true // We assume the host is there if we have a code
    };
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
            player1: { ...prev.player1, name: payload.name, secretNumber: payload.secret },
            range: payload.range || prev.range,
            isPlayer1Ready: payload.isReady,
          }));
        }
      });

      channel.subscribe('start-duel', () => updateState(prev => ({ ...prev, status: 'playing' })));

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

  const completeGuestSetup = useCallback(async (name: string, secret: number) => {
    updateState(prev => ({
      ...prev,
      player2: initialPlayer(name, secret),
      isPlayer2Ready: true,
      status: 'lobby',
    }));

    if (channelRef.current) {
      // Immediate pulse of final Ready state
      channelRef.current.publish('guest-heartbeat', { 
        name, 
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

    const isWinner = feedback === 'Correct!';
    const nextTurn = isWinner ? currentTurn : (currentTurn === 'player1' ? 'player2' : 'player1');

    updateState(prev => ({
      ...prev,
      [currentTurn]: {
        ...prev[currentTurn],
        attempts: prev[currentTurn].attempts + 1,
        history: [{ guess, feedback }, ...prev[currentTurn].history],
      },
      currentTurn: nextTurn as 'player1' | 'player2',
      status: isWinner ? 'finished' : 'playing',
      winner: isWinner ? currentTurn : null,
    }));

    if (channelRef.current) {
      channelRef.current.publish('guess-made', { guess, feedback, nextTurn, isWinner });
    }
    return feedback;
  }, [updateState]);

  const startGame = useCallback(() => {
    if (latestStateRef.current.playerId === 'player1' && channelRef.current) {
      channelRef.current.publish('start-duel', {});
      updateState(prev => ({ ...prev, status: 'playing' }));
    }
  }, [updateState]);

  const resetGame = useCallback(() => {
    updateState(prev => ({
      ...initialState,
      roomCode: prev.roomCode,
      playerId: prev.playerId,
      status: 'lobby',
      player1: { ...prev.player1, attempts: 0, history: [] },
      player2: { ...prev.player2, attempts: 0, history: [] },
    }));
  }, [updateState]);

  const startNewGame = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    updateState(initialState);
  }, [updateState]);

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
      startGame
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
