'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, User, Activity } from 'lucide-react';
import { useGame } from '@/context/GameContext';

const ScoreBoard: React.FC = () => {
  const { gameState } = useGame();
  const { player1, player2, range, currentTurn, status, playerId } = gameState;

  const isPlayer1Me = playerId === 'player1';
  const leftPlayer = isPlayer1Me ? player1 : player2;
  const rightPlayer = isPlayer1Me ? player2 : player1;
  const leftPlayerId = isPlayer1Me ? 'player1' : 'player2';
  const rightPlayerId = isPlayer1Me ? 'player2' : 'player1';

  const PlayerCard = ({ p, id }: { p: typeof player1, id: 'player1' | 'player2' }) => (
    <div className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
      currentTurn === id && status === 'playing'
        ? `${id === 'player1' ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'bg-purple-600/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)]'} scale-[1.02]` 
        : 'bg-slate-900 border-slate-800 opacity-60'
    }`}>
      <div className="flex flex-col items-center">
        <div className={`p-2 rounded-xl mb-3 ${currentTurn === id ? (id === 'player1' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white') : 'bg-slate-800 text-slate-400'}`}>
          <User size={20} />
        </div>
        <h3 className="font-bold text-white text-center truncate w-full mb-1">
          {p.name} {playerId === id && '(You)'}
        </h3>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Activity size={12} />
            <span>{p.attempts} attempts</span>
          </div>
          {playerId === id && (
            <div className="mt-1 flex flex-col items-center">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">Your Secret</span>
              <div className={`flex items-center gap-1.5 ${id === 'player1' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-purple-500/10 border-purple-500/20'} px-2 py-0.5 rounded-lg border`}>
                <span className={`text-xs font-black ${id === 'player1' ? 'text-blue-400' : 'text-purple-400'} uppercase tracking-tight leading-none`}>
                  {gameState.mode === 'numeric' ? p.secretNumber : p.secretWord}
                </span>
                {gameState.mode === 'numeric' && gameState.difficulty === 'hard' && (
                  <span className="text-[8px] font-black text-red-400 animate-pulse leading-none">
                    +{(p.secretNumber - (p.initialSecretNumber || p.secretNumber))}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {currentTurn === id && status === 'playing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute -top-2 -right-2 ${id === 'player1' ? 'bg-blue-500' : 'bg-purple-500'} text-[10px] font-black uppercase text-white px-2 py-0.5 rounded-full shadow-lg`}
          >
            TURN
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <PlayerCard p={leftPlayer} id={leftPlayerId} />
        <PlayerCard p={rightPlayer} id={rightPlayerId} />
      </div>
      
      {/* Turn Indicator Banner */}
      {status === 'playing' && (
        <motion.div 
          key={currentTurn}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-slate-400">
            It&apos;s <span className="text-white font-bold">{gameState[currentTurn].name}</span>&apos;s turn to guess!
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ScoreBoard;
