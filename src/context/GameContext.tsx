'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import * as Ably from 'ably';
import { GameState, GameStatus, Player, Feedback } from '@/types/game';

interface GameContextType {
  gameState: GameState;
  createRoom: () => string;
  joinRoom: (code: string) => void;
  setSetup: (p1Name: string, p2Name: string, min: number, max: number, p1Secret: number, p2Secret: number) => void;
  makeGuess: (guess: number) => Feedback;
  resetGame: () => void;
  startNewGame: () => void;
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
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const ABLY_KEY = process.env.NEXT_PUBLIC_ABLY_API_KEY;

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const latestStateRef = useRef<GameState>(gameState);

  // Keep ref in sync
  useEffect(() => {
    latestStateRef.current = gameState;
  }, [gameState]);

  // Initialize Ably
  useEffect(() => {
    if (ABLY_KEY && ABLY_KEY !== 'your_ably_api_key_here') {
      ablyRef.current = new Ably.Realtime({ key: ABLY_KEY });
      console.log('Ably initialized');
    }
    return () => {
      ablyRef.current?.close();
    };
  }, []);

  const createRoom = useCallback(() => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log('Creating room:', code);
    setGameState(prev => ({ ...prev, roomCode: code, playerId: 'player1', status: 'lobby' }));
    
    if (ablyRef.current) {
      const channel = ablyRef.current.channels.get(`room-${code}`);
      channelRef.current = channel;
      
      // Subscribe to player updates (names, secrets, range)
      channel.subscribe('player-ready', (msg) => {
        console.log('Player ready event:', msg.data);
        const { playerId, name, secret, range } = msg.data;
        const pKey = playerId as 'player1' | 'player2';
        if (msg.connectionId !== ablyRef.current?.connection.id) {
          setGameState(prev => ({
            ...prev,
            [pKey]: { ...prev[pKey], name, secretNumber: secret },
            range: range || prev.range,
            isOpponentPresent: true,
          }));
        }
      });

      // Subscribe to guesses
      channel.subscribe('guess-made', (msg) => {
        console.log('Guess received:', msg.data);
        if (msg.connectionId !== ablyRef.current?.connection.id) {
          const { guess, feedback, nextTurn, isWinner } = msg.data;
          setGameState(prev => {
            const currentPlayerKey = prev.currentTurn;
            const updatedPlayer = {
              ...prev[currentPlayerKey],
              attempts: prev[currentPlayerKey].attempts + 1,
              history: [{ guess, feedback }, ...prev[currentPlayerKey].history],
            };
            return {
              ...prev,
              [currentPlayerKey]: updatedPlayer,
              currentTurn: nextTurn,
              status: isWinner ? 'finished' : 'playing',
              winner: isWinner ? currentPlayerKey : null,
            };
          });
        }
      });

      channel.subscribe('request-sync', () => {
        console.log('Sync requested by peer');
        if (channelRef.current) {
          channelRef.current.publish('full-sync', latestStateRef.current);
        }
      });

      channel.subscribe('full-sync', (msg) => {
        if (msg.connectionId !== ablyRef.current?.connection.id) {
          console.log('Received full sync:', msg.data);
          setGameState(prev => ({
            ...msg.data,
            roomCode: prev.roomCode,
            playerId: prev.playerId,
            isOpponentPresent: true
          }));
        }
      });
    }
    return code;
  }, []);

  const joinRoom = useCallback(async (code: string) => {
    console.log('Joining room:', code);
    setGameState(prev => ({ ...prev, roomCode: code, playerId: 'player2', isOpponentPresent: true }));
    
    if (ablyRef.current) {
      const channel = ablyRef.current.channels.get(`room-${code}`);
      channelRef.current = channel;
      
      // Setup same subscriptions for guest
      channel.subscribe('player-ready', (msg) => {
        const { playerId, name, secret, range } = msg.data;
        const pKey = playerId as 'player1' | 'player2';
        if (msg.connectionId !== ablyRef.current?.connection.id) {
          setGameState(prev => ({
            ...prev,
            [pKey]: { ...prev[pKey], name, secretNumber: secret },
            range: range || prev.range,
          }));
        }
      });

      channel.subscribe('guess-made', (msg) => {
        if (msg.connectionId !== ablyRef.current?.connection.id) {
          const { guess, feedback, nextTurn, isWinner } = msg.data;
          setGameState(prev => {
            const currentPlayerKey = prev.currentTurn;
            const updatedPlayer = {
              ...prev[currentPlayerKey],
              attempts: prev[currentPlayerKey].attempts + 1,
              history: [{ guess, feedback }, ...prev[currentPlayerKey].history],
            };
            return {
              ...prev,
              [currentPlayerKey]: updatedPlayer,
              currentTurn: nextTurn,
              status: isWinner ? 'finished' : 'playing',
              winner: isWinner ? currentPlayerKey : null,
            };
          });
        }
      });

      channel.subscribe('full-sync', (msg) => {
        if (msg.connectionId !== ablyRef.current?.connection.id) {
          console.log('Received full sync from host:', msg.data);
          setGameState(prev => ({
            ...msg.data,
            roomCode: prev.roomCode,
            playerId: prev.playerId,
            isOpponentPresent: true
          }));
        }
      });

      if (ablyRef.current.connection.state !== 'connected') {
        await new Promise(resolve => ablyRef.current?.connection.once('connected', resolve));
      }
      channel.publish('request-sync', {});
    }
  }, []);

  const setSetup = useCallback((
    p1Name: string,
    p2Name: string,
    min: number,
    max: number,
    p1Secret: number,
    p2Secret: number
  ) => {
    const pId = latestStateRef.current.playerId as 'player1' | 'player2';
    if (!pId) return;

    const name = pId === 'player1' ? p1Name : p2Name;
    const secret = pId === 'player1' ? p1Secret : p2Secret;
    const range = pId === 'player1' ? { min, max } : undefined;

    setGameState(prev => ({
      ...prev,
      [pId]: { ...prev[pId], name, secretNumber: secret },
      range: range || prev.range,
      status: 'playing',
    }));

    if (channelRef.current) {
      console.log('Sending player-ready:', { pId, name, secret, range });
      channelRef.current.publish('player-ready', { playerId: pId, name, secret, range });
    }
  }, []);

  const makeGuess = useCallback((guess: number): Feedback => {
    let feedback: Feedback = null;
    const prev = latestStateRef.current;
    
    if (prev.status !== 'playing' || prev.winner) return null;

    const currentPlayerKey = prev.currentTurn;
    const opponentPlayerKey = prev.currentTurn === 'player1' ? 'player2' : 'player1';
    const opponentSecret = prev[opponentPlayerKey].secretNumber;

    if (guess > opponentSecret) feedback = 'Too High';
    else if (guess < opponentSecret) feedback = 'Too Low';
    else feedback = 'Correct!';

    const isWinner = feedback === 'Correct!';
    const nextTurn = isWinner ? prev.currentTurn : opponentPlayerKey;

    setGameState(s => ({
      ...s,
      [currentPlayerKey]: {
        ...s[currentPlayerKey],
        attempts: s[currentPlayerKey].attempts + 1,
        history: [{ guess, feedback }, ...s[currentPlayerKey].history],
      },
      currentTurn: nextTurn,
      status: isWinner ? 'finished' : 'playing',
      winner: isWinner ? currentPlayerKey : null,
    }));

    if (channelRef.current) {
      channelRef.current.publish('guess-made', { guess, feedback, nextTurn, isWinner });
    }

    return feedback;
  }, []);

  const resetGame = useCallback(() => {
    setGameState((prev) => {
      const newState: GameState = {
        ...prev,
        player1: { ...prev.player1, attempts: 0, history: [] },
        player2: { ...prev.player2, attempts: 0, history: [] },
        currentTurn: 'player1',
        status: 'playing',
        winner: null,
      };
      if (channelRef.current) channelRef.current.publish('full-sync', newState);
      return newState;
    });
  }, []);

  const startNewGame = useCallback(() => {
    setGameState(initialState);
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  }, []);

  return (
    <GameContext.Provider value={{ gameState, createRoom, joinRoom, setSetup, makeGuess, resetGame, startNewGame }}>
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
