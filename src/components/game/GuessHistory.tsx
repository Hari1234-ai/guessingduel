'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, MoveDown, MoveUp, CheckCircle2 } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { Feedback } from '@/types/game';

const GuessHistory: React.FC = () => {
  const { gameState } = useGame();
  const { playerId } = gameState;
  const [activeTab, setActiveTab] = useState<'player1' | 'player2'>('player1');

  const history = gameState[activeTab].history;
  const playerName = gameState[activeTab].name;

  const getFeedbackIcon = (feedback: Feedback) => {
    switch (feedback) {
      case 'Too High': return <MoveDown className="text-red-400" size={16} />;
      case 'Too Low': return <MoveUp className="text-blue-400" size={16} />;
      case 'Correct!': return <CheckCircle2 className="text-green-400" size={16} />;
      default: return null;
    }
  };

  const getFeedbackStyles = (feedback: Feedback) => {
    switch (feedback) {
      case 'Too High': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Too Low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Correct!': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="w-full bg-slate-900/10 border border-slate-800/50 rounded-3xl overflow-hidden flex flex-col h-[400px]">
      <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400">
          <History size={18} />
          <h3 className="font-bold text-sm uppercase tracking-wider">Duel Logs</h3>
        </div>
      </div>

      <div className="flex bg-slate-900 border-b border-slate-800 text-sm font-medium">
        <button
          onClick={() => setActiveTab('player1')}
          className={`flex-1 py-3 transition-colors relative ${activeTab === 'player1' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
          {gameState.player1.name} {playerId === 'player1' && '(You)'}
          {activeTab === 'player1' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('player2')}
          className={`flex-1 py-3 transition-colors relative ${activeTab === 'player2' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
          {gameState.player2.name} {playerId === 'player2' && '(You)'}
          {activeTab === 'player2' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 italic">
            <p>No guesses yet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {history.map((entry, idx) => (
                <motion.li
                  key={history.length - idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${getFeedbackStyles(entry.feedback)}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black">{entry.guess}</span>
                    <span className="text-xs uppercase font-bold opacity-80">{entry.feedback}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/20">
                    {getFeedbackIcon(entry.feedback)}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
};

export default GuessHistory;
