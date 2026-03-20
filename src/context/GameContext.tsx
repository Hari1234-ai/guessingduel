'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import * as Ably from 'ably';
import { GameState, Player, Feedback } from '@/types/game';

interface GameContextType {
  gameState: GameState;
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
      ablyRef.current = new Ably.Realtime({ 
        key: ABLY_KEY,
        clientId: `client-${Math.random().toString(36).substring(2, 7)}`
      });
      console.log('Ably initialized');
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

  // Sync state from Ably Presence members
  const syncFromPresence = useCallback(async (channel: Ably.RealtimeChannel) => {
    try {
      const members = await channel.presence.get();
      console.log('Presence Sync: Current Members:', members.map(m => ({ id: m.clientId, data: m.data })));
      
      updateState(prev => {
        let newState = { ...prev };
        let foundOpponent = false;

        members.forEach((member) => {
          const data = member.data;
          if (!data || !data.playerId) return;

          // Don't overwrite ourselves
          if (member.connectionId === ablyRef.current?.connection.id) return;

          foundOpponent = true;
          if (data.playerId === 'player1') {
            newState = {
              ...newState,
              player1: { ...newState.player1, name: data.name, secretNumber: data.secret },
              range: data.range || newState.range,
              isPlayer1Ready: data.isReady,
              isOpponentPresent: true
            };
          } else if (data.playerId === 'player2') {
            newState = {
              ...newState,
              player2: { ...newState.player2, name: data.name, secretNumber: data.secret },
              isPlayer2Ready: data.isReady,
              isOpponentPresent: true
            };
          }
        });

        // If no opponent found in presence, mark them absent
        if (!foundOpponent && prev.roomCode) {
          newState.isOpponentPresent = false;
        }

        return newState;
      });
    } catch (err) {
      console.error('Error syncing from presence:', err);
    }
  }, [updateState]);

  const createRoom = useCallback(async (name: string, secret: number, min: number, max: number) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log('Ably Presence: Creating Room:', code);
    
    // 1. Set Local State
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
    
    // 2. Setup Channel & Presence
    if (ablyRef.current) {
      const channel = ablyRef.current.channels.get(`room-${code}`);
      channelRef.current = channel;
      
      // Subscribe to Presence updates
      channel.presence.subscribe(['enter', 'present', 'update', 'leave'], () => {
        syncFromPresence(channel);
      });

      // Enter Presence as Host
      await channel.presence.enter({ 
        playerId: 'player1', 
        name, 
        secret, 
        range: { min, max }, 
        isReady: true 
      });

      // Game Events
      channel.subscribe('start-duel', () => {
        updateState(prev => ({ ...prev, status: 'playing' }));
      });

      channel.subscribe('guess-made', (msg) => {
        if (msg.connectionId !== ablyRef.current?.connection.id) {
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
  }, [syncFromPresence, updateState]);

  const joinRoom = useCallback(async (code: string) => {
    console.log('Ably Presence: Joining Room:', code);
    
    // 1. Set Local Join State
    const newState: GameState = { 
      ...initialState, 
      roomCode: code, 
      playerId: 'player2', 
      status: 'guest-setup', 
      isOpponentPresent: true 
    };
    latestStateRef.current = newState;
    setGameState(newState);
    
    if (ablyRef.current) {
      const channel = ablyRef.current.channels.get(`room-${code}`);
      channelRef.current = channel;
      
      // Subscribe to Presence
      channel.presence.subscribe(['enter', 'present', 'update', 'leave'], () => {
        syncFromPresence(channel);
      });

      // Enter Presence as Challenger (Not ready yet)
      await channel.presence.enter({ 
        playerId: 'player2', 
        name: 'Challenger Joining...', 
        isReady: false 
      });

      // Initial Presence Sync
      syncFromPresence(channel);

      // Handle Events
      channel.subscribe('start-duel', () => {
        updateState(prev => ({ ...prev, status: 'playing' }));
      });

      channel.subscribe('guess-made', (msg) => {
        if (msg.connectionId !== ablyRef.current?.connection.id) {
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
  }, [syncFromPresence, updateState]);

  const completeGuestSetup = useCallback(async (name: string, secret: number) => {
    console.log('Ably Presence: Guest Ready:', name);
    
    updateState(prev => ({
      ...prev,
      player2: initialPlayer(name, secret),
      isPlayer2Ready: true,
      status: 'lobby',
    }));

    if (channelRef.current) {
      await channelRef.current.presence.update({ 
        playerId: 'player2', 
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
      channelRef.current.publish('guess-made', { 
        guess, 
        feedback, 
        nextTurn, 
        isWinner 
      });
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
      channelRef.current.presence.leave();
      channelRef.current = null;
    }
    updateState(initialState);
  }, [updateState]);

  return (
    <GameContext.Provider value={{ 
      gameState, 
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
