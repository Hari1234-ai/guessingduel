'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { Target, ArrowRight, Trophy, X, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

const ActiveMatchBanner: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { gameState } = useGame();
  const { status, roomCode, player1, player2, winner, playerId } = gameState;
  const [showFinishedNotification, setShowFinishedNotification] = useState(false);

  // Determine if we should show the banner
  // Show if: playing/lobby/guest-setup, not on game page, not an AI match 
  const isMatchActive = (status === 'playing' || status === 'lobby' || status === 'guest-setup') && roomCode && !player2.isAI;
  const isAwayFromMatch = !pathname.startsWith('/game');
  const shouldShowBanner = isMatchActive && isAwayFromMatch;

  // Handle match finishing while away
  useEffect(() => {
    if (status === 'finished' && isAwayFromMatch && roomCode && !player2.isAI) {
      setShowFinishedNotification(true);
      // Auto-hide notification after 10 seconds
      const timer = setTimeout(() => setShowFinishedNotification(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [status, isAwayFromMatch, roomCode, player2.isAI]);

  // Determine result for notification
  const opponentName = playerId === 'player1' ? player2.name : player1.name;
  const didIWin = winner === playerId;

  return (
    <>
      <AnimatePresence>
        {shouldShowBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
          >
            <div className="bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 p-4 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.2)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <Target size={20} className="animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Match in Progress</span>
                  <span className="text-sm font-bold text-white truncate max-w-[150px]">vs {opponentName}</span>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/game')}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] h-10 px-4 group"
              >
                Return <ArrowRight size={14} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </motion.div>
        )}

        {showFinishedNotification && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm"
          >
            <div className={`p-5 rounded-2xl border-2 shadow-2xl backdrop-blur-xl ${
              didIWin ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                  didIWin ? 'bg-green-500 text-white border-green-400' : 'bg-red-500 text-white border-red-400'
                }`}>
                  {didIWin ? <Trophy size={24} /> : <AlertCircle size={24} />}
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-lg font-black uppercase tracking-tight text-white">
                    Match Result
                  </h4>
                  <p className="text-sm text-slate-400 font-medium">
                    {didIWin 
                      ? "You outsmarted your rival!" 
                      : `${opponentName} has emerged victorious.`}
                  </p>
                  <div className="pt-2 flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setShowFinishedNotification(false);
                        router.push('/history');
                      }}
                      className="bg-slate-800 text-white font-bold"
                    >
                      History
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => setShowFinishedNotification(false)}
                      className="bg-transparent border border-slate-700 text-slate-400 font-bold"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
                <button 
                  onClick={() => setShowFinishedNotification(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ActiveMatchBanner;
