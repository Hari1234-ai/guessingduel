'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, User, Activity } from 'lucide-react';
import { useGame } from '@/context/GameContext';

const ScoreBoard: React.FC = () => {
  const { gameState } = useGame();
  const { player1, player2, range, currentTurn, status, playerId } = gameState;

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Player 1 Card */}
        <div className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
          currentTurn === 'player1' && status === 'playing'
            ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] scale-[1.02]' 
            : 'bg-slate-900 border-slate-800 opacity-60'
        }`}>
          <div className="flex flex-col items-center">
            <div className={`p-2 rounded-xl mb-3 ${currentTurn === 'player1' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <User size={20} />
            </div>
            <h3 className="font-bold text-white text-center truncate w-full mb-1">
              {player1.name} {playerId === 'player1' && '(You)'}
            </h3>
            <div className="flex items-center gap-1.5 text-slate-400 text-sm">
              <Activity size={14} />
              <span>{player1.attempts} attempts</span>
            </div>
          </div>
          
          <AnimatePresence>
            {currentTurn === 'player1' && status === 'playing' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-2 -right-2 bg-blue-500 text-[10px] font-black uppercase text-white px-2 py-0.5 rounded-full shadow-lg"
              >
                TURN
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Player 2 Card */}
        <div className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
          currentTurn === 'player2' && status === 'playing'
            ? 'bg-purple-600/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)] scale-[1.02]' 
            : 'bg-slate-900 border-slate-800 opacity-60'
        }`}>
          <div className="flex flex-col items-center">
            <div className={`p-2 rounded-xl mb-3 ${currentTurn === 'player2' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <User size={20} />
            </div>
            <h3 className="font-bold text-white text-center truncate w-full mb-1">
              {player2.name} {playerId === 'player2' && '(You)'}
            </h3>
            <div className="flex items-center gap-1.5 text-slate-400 text-sm">
              <Activity size={14} />
              <span>{player2.attempts} attempts</span>
            </div>
          </div>

          <AnimatePresence>
            {currentTurn === 'player2' && status === 'playing' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-2 -right-2 bg-purple-500 text-[10px] font-black uppercase text-white px-2 py-0.5 rounded-full shadow-lg"
              >
                TURN
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
