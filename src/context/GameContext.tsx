'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import * as Ably from 'ably';
import { GameState, Player, Feedback, GameMode, WordLetterStatus, WordFeedback } from '@/types/game';
import { getRandomAIWord } from "@/utils/wordList";

interface GameContextType {
  gameState: GameState;
  connectionStatus: 'connecting' | 'connected' | 'failed' | 'disconnected';
  createRoom: (name: string, uid: string, secret: number | string, mode: GameMode, wordLength?: number, min?: number, max?: number) => Promise<string>;
  joinRoom: (code: string, uid: string) => Promise<void>;
  completeGuestSetup: (name: string, uid: string, secret: number | string) => Promise<void>;
  makeGuess: (guess: number | string) => Feedback;
  resetGame: () => void;
  startNewGame: () => void;
  startGame: () => void;
  startWithAI: (uid: string) => void;
  latestReaction: { emoji: string; timestamp: number } | null;
  sendReaction: (emoji: string) => void;
}

const initialPlayer = (name: string = '', uid: string = '', secretNumber: number = 0, secretWord?: string): Player => ({
  name,
  uid,
  secretNumber,
  secretWord,
  attempts: 0,
  history: [],
});

const initialState: GameState = {
  player1: initialPlayer('Player 1'),
  player2: initialPlayer('Player 2'),
  mode: 'numeric',
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
  const [latestReaction, setLatestReaction] = useState<{ emoji: string; timestamp: number } | null>(null);
  
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
    // Run an independent interval that continuously checks refs
    const interval = setInterval(() => {
      const channel = channelRef.current;
      const state = latestStateRef.current;
      
      if (!channel) return;
      
      // Host pulses to help Guests
      if (state.playerId === 'player1' && state.roomCode) {
        console.log(`[Interval] Publishing host-heartbeat to room-${state.roomCode}`);
        channel.publish('host-heartbeat', {
          name: state.player1.name || 'Player 1',
          uid: state.player1.uid || '',
          secret: state.player1.secretNumber || 0,
          range: state.range || { min: 1, max: 100 },
          isReady: !!state.isPlayer1Ready,
        }).then(() => console.log('Host pulse published OK')).catch(err => console.error('Host pulse error', err));
      }
      
      // Guest pulses to help Hosts
      if (state.playerId === 'player2' && state.roomCode) {
        console.log(`[Interval] Publishing guest-heartbeat to room-${state.roomCode}`);
        channel.publish('guest-heartbeat', {
          name: state.player2.name || 'Challenger Joining...',
          uid: state.player2.uid || '',
          secret: state.player2.secretNumber || 0,
          isReady: !!state.isPlayer2Ready,
        }).then(() => console.log('Guest pulse published OK')).catch(err => console.error('Guest pulse error', err));
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []); // No dependencies needed, safely uses refs

  const getWordFeedback = (guess: string, secret: string): WordFeedback => {
    const status: WordLetterStatus[] = Array(secret.length).fill('absent');
    const secretChars = secret.toUpperCase().split('');
    const guessChars = guess.toUpperCase().split('');
    
    // First pass: Correct positions
    for (let i = 0; i < guessChars.length; i++) {
      if (guessChars[i] === secretChars[i]) {
        status[i] = 'correct';
        secretChars[i] = '#'; // Mark as used
      }
    }
    
    // Second pass: Present but wrong position
    for (let i = 0; i < guessChars.length; i++) {
      if (status[i] !== 'correct') {
        const charIndex = secretChars.indexOf(guessChars[i]);
        if (charIndex !== -1) {
          status[i] = 'present';
          secretChars[charIndex] = '#'; // Mark as used
        }
      }
    }
    
    return { status, isCorrect: status.every(s => s === 'correct') };
  };


  const createRoom = useCallback(async (name: string, uid: string, secret: number | string, mode: GameMode, wordLength?: number, min: number = 1, max: number = 100) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newState: GameState = { 
      ...initialState, 
      roomCode: code, 
      playerId: 'player1', 
      status: 'lobby',
      mode,
      wordLength,
      player1: {
        ...initialPlayer(name, uid),
        secretNumber: typeof secret === 'number' ? secret : 0,
        secretWord: typeof secret === 'string' ? secret : undefined,
      },
      range: { min, max },
      isPlayer1Ready: true,
      isOpponentPresent: false,
    };
    
    latestStateRef.current = newState;
    
    if (ablyRef.current) {
      const channel = ablyRef.current.channels.get(`room-${code}`);
      channelRef.current = channel;

      // Immediate pulse so guest sees us right away
      console.log(`[Host] Subscribing to guest-heartbeat on room-${code}`);
      channel.publish('host-heartbeat', {
        name: newState.player1.name,
        uid: newState.player1.uid,
        secret: newState.player1.secretNumber,
        range: newState.range,
        isReady: true,
      });

      // Host Listens for Guest Heartbeats
      channel.subscribe('guest-heartbeat', (msg) => {
        const payload = msg.data || {};
        updateState(prev => {
          // Protect guest name from being overwritten by 'Challenger Joining...' if they are already ready
          const newGuestName = (payload.name && payload.name.includes('.')) && prev.isPlayer2Ready 
            ? prev.player2.name 
            : (payload.name || prev.player2.name || 'Player 2');

          return {
            ...prev,
            isOpponentPresent: true,
            player2: { 
              ...prev.player2, 
              name: newGuestName, 
              uid: payload.uid || prev.player2.uid,
              secretNumber: (prev.playerId !== 'player2' && payload.secret && payload.secret !== 0) ? payload.secret : prev.player2.secretNumber 
            },
            isPlayer2Ready: payload.isReady || prev.isPlayer2Ready,
          };
        });
      });

      // Subscribe to actions
      channel.subscribe('start-match', (msg) => {
        const payload = msg.data;
        updateState(prev => ({ 
          ...prev, 
          status: 'playing',
          // Merge state cautiously: Never overwrite our own player object
          player1: prev.playerId === 'player1' ? prev.player1 : (payload.player1 || prev.player1),
          player2: prev.playerId === 'player2' ? prev.player2 : (payload.player2 || prev.player2),
          range: payload.range || prev.range
        }));
      });

      channel.subscribe('reaction', (msg) => {
        setLatestReaction({ emoji: msg.data.emoji, timestamp: Date.now() });
      });

      // Handle re-sync requests: Re-publish current state
      channel.subscribe('request-sync', (msg) => {
        if (msg.clientId !== ablyRef.current?.clientId) {
          const state = latestStateRef.current;
          channel.publish('sync-response', {
            player1: state.player1,
            player2: state.player2,
            range: state.range
          });
        }
      });

      // Handle re-sync responses: Merge carefully
      channel.subscribe('sync-response', (msg) => {
        if (msg.clientId !== ablyRef.current?.clientId) {
          const payload = msg.data;
          updateState(prev => ({
            ...prev,
            player1: prev.playerId === 'player1' ? prev.player1 : (payload.player1 || prev.player1),
            player2: prev.playerId === 'player2' ? prev.player2 : (payload.player2 || prev.player2),
            range: payload.range || prev.range
          }));
        }
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
                attempts: prev[currentPlayerKey].attempts + (guess === -1 ? 0 : 1),
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

    setGameState(newState);
    return code;
  }, [updateState]);

  const joinRoom = useCallback(async (code: string, uid: string) => {
    const cleanCode = code.trim().toUpperCase();
    const newState: GameState = { 
      ...initialState, 
      roomCode: cleanCode, 
      playerId: 'player2', 
      status: 'guest-setup', 
      isOpponentPresent: true // We assume the host is there if we have a code
    };
    // Initialize guest with uid early
    newState.player2.uid = uid;
    latestStateRef.current = newState;
    
    if (ablyRef.current) {
      const channel = ablyRef.current.channels.get(`room-${code}`);
      channelRef.current = channel;

      // Guest Listens for Host Heartbeats
      channel.subscribe('host-heartbeat', (msg) => {
        const payload = msg.data || {};
        updateState(prev => ({
          ...prev,
          isOpponentPresent: true,
          mode: payload.mode || prev.mode,
          wordLength: payload.wordLength || prev.wordLength,
          player1: { 
            ...prev.player1, 
            name: payload.name || prev.player1.name || 'Player 1', 
            uid: payload.uid || prev.player1.uid, 
            secretNumber: (prev.playerId !== 'player1' && payload.secret && payload.secret !== 0) ? payload.secret : prev.player1.secretNumber,
            secretWord: (prev.playerId !== 'player1' && payload.secretWord) ? payload.secretWord : prev.player1.secretWord
          },
          range: payload.range || prev.range,
          isPlayer1Ready: payload.isReady || prev.isPlayer1Ready,
        }));
      });

      channel.subscribe('start-match', (msg) => {
        const payload = msg.data;
        updateState(prev => ({ 
          ...prev, 
          status: 'playing',
          player1: prev.playerId === 'player1' ? prev.player1 : (payload.player1 || prev.player1),
          player2: prev.playerId === 'player2' ? prev.player2 : (payload.player2 || prev.player2),
          range: payload.range || prev.range
        }));
      });

      channel.subscribe('reaction', (msg) => {
        setLatestReaction({ emoji: msg.data.emoji, timestamp: Date.now() });
      });

      // Handle re-sync requests: Re-publish current state
      channel.subscribe('request-sync', (msg) => {
        if (msg.clientId !== ablyRef.current?.clientId) {
          const state = latestStateRef.current;
          channel.publish('sync-response', {
            player1: state.player1,
            player2: state.player2,
            range: state.range
          });
        }
      });

      // Handle re-sync responses: Merge carefully
      channel.subscribe('sync-response', (msg) => {
        if (msg.clientId !== ablyRef.current?.clientId) {
          const payload = msg.data;
          updateState(prev => ({
            ...prev,
            player1: prev.playerId === 'player1' ? prev.player1 : (payload.player1 || prev.player1),
            player2: prev.playerId === 'player2' ? prev.player2 : (payload.player2 || prev.player2),
            range: payload.range || prev.range
          }));
        }
      });

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
                attempts: prev[currentPlayerKey].attempts + (guess === -1 ? 0 : 1),
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
        name: newState.player2.name || 'Challenger Joining...',
        uid: newState.player2.uid,
        secret: 0,
        isReady: false,
      });
    }

    setGameState(newState);
  }, [updateState]);

  const completeGuestSetup = useCallback(async (name: string, uid: string, secret: number | string) => {
    updateState(prev => ({
      ...prev,
      player2: {
        ...initialPlayer(name, uid),
        secretNumber: typeof secret === 'number' ? secret : 0,
        secretWord: typeof secret === 'string' ? secret : undefined,
      },
      isPlayer2Ready: true,
      status: 'lobby',
    }));

    if (channelRef.current) {
      // Immediate pulse of final Ready state
      channelRef.current.publish('guest-heartbeat', { 
        name, 
        uid,
        secret: typeof secret === 'number' ? secret : 0,
        secretWord: typeof secret === 'string' ? secret : undefined,
        isReady: true 
      });
    }
  }, [updateState]);

  const makeGuess = useCallback((guess: number | string): Feedback => {
    const state = latestStateRef.current;
    if (state.status !== 'playing') return null;

    const { player1, player2, currentTurn } = state;
    const opponent = currentTurn === 'player1' ? player2 : player1;
    
    let feedback: Feedback = null;
    let isWinner = false;

    if (state.mode === 'numeric') {
      const g = typeof guess === 'number' ? guess : parseInt(guess as string);
      const secret = opponent.secretNumber;
      
      if (g > secret) feedback = 'Too High';
      else if (g < secret) feedback = 'Too Low';
      else {
        feedback = 'Correct!';
        isWinner = true;
      }
    } else {
      const g = typeof guess === 'string' ? guess.toUpperCase() : guess.toString().toUpperCase();
      const secret = opponent.secretWord;
      
      if (!secret) return null;
      
      const wordFeedback = getWordFeedback(g, secret);
      feedback = wordFeedback;
      isWinner = wordFeedback.isCorrect;
    }

    const actualFeedback: Feedback = guess === -1 ? 'Time Out' : feedback;
    const nextTurn = isWinner ? currentTurn : (currentTurn === 'player1' ? 'player2' : 'player1');

    updateState(prev => ({
      ...prev,
      [currentTurn]: {
        ...prev[currentTurn],
        attempts: prev[currentTurn].attempts + (guess === -1 ? 0 : 1),
        history: [{ guess, feedback: actualFeedback as Feedback, timestamp: Date.now() }, ...prev[currentTurn].history],
      },
      currentTurn: nextTurn as 'player1' | 'player2',
      status: isWinner ? 'finished' : 'playing',
      winner: isWinner ? currentTurn : null,
      turnTimeLeft: 30, // Reset timer
    }));

    if (channelRef.current) {
      channelRef.current.publish('guess-made', { guess, feedback: actualFeedback, nextTurn, isWinner });
    }
    return actualFeedback;
  }, [updateState, getWordFeedback]);

  // AI Logic: Automated turn when it's AI's turn
  useEffect(() => {
    const { status, currentTurn, player2, range } = gameState;
    
    if (status === 'playing' && currentTurn === 'player2' && player2.isAI) {
        const delay = 1500 + Math.random() * 3000;
        const timer = setTimeout(() => {
          if (gameState.mode === 'numeric') {
            // AI Logic: Smart Binary Search based on its own history
            let currentMin = range.min;
            let currentMax = range.max;
            
            player2.history.forEach(h => {
              if (typeof h.guess === 'number' && typeof h.feedback === 'string') {
                if (h.feedback === 'Too Low') {
                  currentMin = Math.max(currentMin, h.guess + 1);
                } else if (h.feedback === 'Too High') {
                  currentMax = Math.min(currentMax, h.guess - 1);
                }
              }
            });
            
            const guess = Math.floor((currentMin + currentMax) / 2);
            makeGuess(guess);
          } else {
            // Word Mode: Pick a random word of the same length
            const wordLength = gameState.wordLength || 5;
            const guess = getRandomAIWord(wordLength);
            makeGuess(guess);
          }
        }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.status, gameState.currentTurn, gameState.player2.isAI, gameState.range, makeGuess]);

  const startWithAI = useCallback((uid: string) => {
    const { range } = latestStateRef.current;
    
    // Generate AI's secret (number or word)
    const mode = latestStateRef.current.mode;
    const wordLength = latestStateRef.current.wordLength || 5;
    const aiSecretNum = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    const aiSecretWord = mode === 'word' ? getRandomAIWord(wordLength) : undefined;
    
    updateState(prev => ({
      ...prev,
      status: 'playing',
      roomCode: `AI-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      player1: { ...prev.player1, uid },
      player2: {
        ...initialPlayer('AI Strategist', 'ai-bot', aiSecretNum, aiSecretWord),
        isAI: true,
      },
      isPlayer2Ready: true,
      isOpponentPresent: true,
      turnTimeLeft: 30,
    }));
  }, [updateState]);

  const startGame = useCallback(() => {
    const state = latestStateRef.current;
    if (state.playerId === 'player1' && channelRef.current) {
      channelRef.current.publish('start-match', {
        player1: state.player1,
        player2: state.player2,
        range: state.range
      });
      updateState(prev => ({ ...prev, status: 'playing' }));
    }
  }, [updateState]);

  const resetGame = useCallback(() => {
    const { playerId, player2, roomCode, player1, range } = latestStateRef.current;
    const isHost = playerId === 'player1';
    const isAI = player2.isAI;
    
    const mode = latestStateRef.current.mode;
    const wordLength = latestStateRef.current.wordLength || 5;
    const aiSecretNum = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    const aiSecretWord = mode === 'word' ? getRandomAIWord(wordLength) : undefined;

    updateState(prev => ({
      ...initialState,
      roomCode: prev.roomCode,
      playerId: prev.playerId,
      range: prev.range,
      mode: prev.mode,
      wordLength: prev.wordLength,
      status: isAI ? 'playing' : (isHost ? 'lobby' : 'guest-setup'), 
      player1: { ...initialPlayer(prev.player1.name, prev.player1.uid), attempts: 0, history: [] },
      player2: isAI ? { 
        ...initialPlayer('AI Strategist', 'ai-bot', aiSecretNum, aiSecretWord), 
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

  // Fail-safe: Pulse re-sync if data is missing during game
  useEffect(() => {
    if (gameState.status === 'playing' && channelRef.current) {
      const isOpponentReady = gameState.mode === 'numeric' 
        ? (gameState.player1.secretNumber !== 0 && gameState.player2.secretNumber !== 0)
        : (gameState.player1.secretWord && gameState.player2.secretWord);
        
      if (!isOpponentReady) {
        const interval = setInterval(() => {
          channelRef.current?.publish('request-sync', {});
        }, 3000);
        return () => clearInterval(interval);
      }
    }
  }, [gameState.status, gameState.player1, gameState.player2, gameState.mode]);

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
      startWithAI,
      latestReaction,
      sendReaction: useCallback((emoji: string) => {
        if (channelRef.current) {
          channelRef.current.publish('reaction', { emoji });
          // Also show locally immediately
          setLatestReaction({ emoji, timestamp: Date.now() });
        }
      }, [])
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
