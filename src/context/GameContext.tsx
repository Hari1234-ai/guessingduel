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
      console.log('Ably: Initializing with API Key');
      const ably = new Ably.Realtime({ 
        key: ABLY_KEY,
        clientId: `user-${Math.random().toString(36).substring(2, 8)}`
      });
      
      ablyRef.current = ably;

      ably.connection.on('connected', () => {
        console.log('Ably: Connected successfully');
        setConnectionStatus('connected');
      });

      ably.connection.on('failed', () => {
        console.error('Ably: Connection failed');
        setConnectionStatus('failed');
      });

      ably.connection.on('disconnected', () => {
        console.warn('Ably: Disconnected');
        setConnectionStatus('disconnected');
      });
    } else {
      console.error('Ably: API Key is missing or invalid');
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

  // Robust Presence Sync
  const syncFromPresence = useCallback(async (channel: Ably.RealtimeChannel) => {
    try {
      const members = await channel.presence.get();
      console.log('Ably Presence Sync: Members in room:', members.length);
      
      updateState(prev => {
        let newState = { ...prev };
        let opponentData: any = null;

        members.forEach((member) => {
          if (!member.data || !member.data.playerId) return;
          
          // Identify the other player
          if (member.clientId !== ablyRef.current?.clientId) {
            opponentData = member.data;
          }
        });

        if (opponentData) {
          const isP1 = opponentData.playerId === 'player1';
          console.log(`Ably Presence Sync: Found ${isP1 ? 'Host' : 'Guest'}:`, opponentData.name);
          
          if (isP1) {
            newState = {
              ...newState,
              player1: { ...newState.player1, name: opponentData.name, secretNumber: opponentData.secret },
              range: opponentData.range || newState.range,
              isPlayer1Ready: opponentData.isReady,
              isOpponentPresent: true
            };
          } else {
            newState = {
              ...newState,
              player2: { ...newState.player2, name: opponentData.name, secretNumber: opponentData.secret },
              isPlayer2Ready: opponentData.isReady,
              isOpponentPresent: true
            };
          }
        } else if (prev.roomCode && prev.isOpponentPresent) {
          // If we had an opponent but don't anymore, mark them as gone
          newState.isOpponentPresent = false;
        }

        return newState;
      });
    } catch (err) {
      console.error('Ably Presence Sync: Error:', err);
    }
  }, [updateState]);

  const createRoom = useCallback(async (name: string, secret: number, min: number, max: number) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log('Ably: Creating Room:', code);
    
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
      
      // Subscribe to Presence
      channel.presence.subscribe(['enter', 'present', 'update', 'leave'], () => {
        syncFromPresence(channel);
      });

      // Explicitly enter presence
      await channel.presence.enter({ 
        playerId: 'player1', 
        name, 
        secret, 
        range: { min, max }, 
        isReady: true 
      });

      // Subscribe to actions
      channel.subscribe('start-duel', () => {
        updateState(prev => ({ ...prev, status: 'playing' }));
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
  }, [syncFromPresence, updateState]);

  const joinRoom = useCallback(async (code: string) => {
    console.log('Ably: Joining Room:', code);
    
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
      
      channel.presence.subscribe(['enter', 'present', 'update', 'leave'], () => {
        syncFromPresence(channel);
      });

      // Enter as Guest (not ready)
      await channel.presence.enter({ 
        playerId: 'player2', 
        name: 'Challenger', 
        isReady: false 
      });

      syncFromPresence(channel);

      channel.subscribe('start-duel', () => {
        updateState(prev => ({ ...prev, status: 'playing' }));
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
  }, [syncFromPresence, updateState]);

  const completeGuestSetup = useCallback(async (name: string, secret: number) => {
    console.log('Ably: Guest Ready:', name);
    
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
      channelRef.current.presence.leave();
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
