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
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const ABLY_KEY = process.env.NEXT_PUBLIC_ABLY_API_KEY;

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const ablyRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

  // Initialize Ably
  useEffect(() => {
    if (ABLY_KEY && ABLY_KEY !== 'your_ably_api_key_here') {
      ablyRef.current = new Ably.Realtime({ key: ABLY_KEY });
    }
    return () => {
      ablyRef.current?.close();
    };
  }, []);

  // Sync state when changed (send to Ably)
  const broadcastState = useCallback((newState: GameState) => {
    if (channelRef.current) {
      channelRef.current.publish('state-update', newState);
    }
  }, []);

  const createRoom = useCallback(() => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGameState(prev => ({ ...prev, roomCode: code, playerId: 'player1' }));
    
    if (ablyRef.current) {
      channelRef.current = ablyRef.current.channels.get(`room-${code}`);
      channelRef.current.subscribe('state-update', (msg) => {
        // Only update if it's from the other player
        if (msg.connectionId !== ablyRef.current?.connection.id) {
          setGameState(msg.data);
        }
      });
    }
    return code;
  }, []);

  const joinRoom = useCallback((code: string) => {
    setGameState(prev => ({ ...prev, roomCode: code, playerId: 'player2' }));
    
    if (ablyRef.current) {
      channelRef.current = ablyRef.current.channels.get(`room-${code}`);
      channelRef.current.subscribe('state-update', (msg) => {
        if (msg.connectionId !== ablyRef.current?.connection.id) {
          setGameState(msg.data);
        }
      });
      // Ping the host that we joined (optional, for presence)
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
    const newState: GameState = {
      ...gameState,
      player1: initialPlayer(p1Name || 'Player 1', p1Secret),
      player2: initialPlayer(p2Name || 'Player 2', p2Secret),
      range: { min, max },
      currentTurn: 'player1',
      status: 'playing',
      winner: null,
    };
    setGameState(newState);
    broadcastState(newState);
  }, [gameState, broadcastState]);

  const makeGuess = useCallback((guess: number): Feedback => {
    let feedback: Feedback = null;
    let finalState: GameState | null = null;
    
    setGameState((prev) => {
      if (prev.status !== 'playing' || prev.winner) return prev;

      const currentPlayerKey = prev.currentTurn;
      const opponentPlayerKey = prev.currentTurn === 'player1' ? 'player2' : 'player1';
      const opponentSecret = prev[opponentPlayerKey].secretNumber;

      if (guess > opponentSecret) feedback = 'Too High';
      else if (guess < opponentSecret) feedback = 'Too Low';
      else feedback = 'Correct!';

      const updatedCurrentPlayer: Player = {
        ...prev[currentPlayerKey],
        attempts: prev[currentPlayerKey].attempts + 1,
        history: [{ guess, feedback }, ...prev[currentPlayerKey].history],
      };

      const isWinner = feedback === 'Correct!';
      
      finalState = {
        ...prev,
        [currentPlayerKey]: updatedCurrentPlayer,
        status: isWinner ? 'finished' : 'playing',
        winner: isWinner ? currentPlayerKey : null,
        currentTurn: isWinner ? prev.currentTurn : opponentPlayerKey,
      };
      
      return finalState;
    });

    // We can't use finalState here directly because setGameState is async, 
    // but in a real app we'd broadcast the updated state.
    // To fix this cleanly, we'd use a reducer or a more robust state sync.
    // For now, I'll use a small trick: broadcast the state after it's set.
    return feedback;
  }, []);

  // Effect to broadcast state after update
  useEffect(() => {
    if (gameState.status !== 'setup' && gameState.roomCode) {
      broadcastState(gameState);
    }
  }, [gameState, broadcastState]);

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
