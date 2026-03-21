'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RotateCcw, LogOut, Trophy, Sparkles, Loader2, Hash } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ScoreBoard from '@/components/game/ScoreBoard';
import GuessHistory from '@/components/game/GuessHistory';

export default function Game() {
  const router = useRouter();
  const { gameState, makeGuess, resetGame, startNewGame } = useGame();
  const { player1, player2, currentTurn, status, winner, roomCode, playerId } = gameState;

  const [guess, setGuess] = useState('');
  const [lastFeedback, setLastFeedback] = useState<{ text: string, type: 'high' | 'low' | 'correct' | null }>({ text: '', type: null });
  const [guess, setGuess] = useState('');
  const [lastFeedback, setLastFeedback] = useState<{ text: string, type: 'high' | 'low' | 'correct' | null }>({ text: '', type: null });

  // Redirect if no setup or room
  useEffect(() => {
    if (status === 'setup' && !roomCode) {
      router.replace('/setup');
    }
  }, [status, roomCode, router]);

  const isMyTurn = currentTurn === playerId;
  const isOpponentReady = player1.secretNumber !== 0 && player2.secretNumber !== 0;

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMyTurn || !isOpponentReady) return;

    const num = parseInt(guess);
    if (isNaN(num)) return;

    const feedback = makeGuess(num);
    const feedbackType = feedback === 'Too High' ? 'high' : feedback === 'Too Low' ? 'low' : 'correct';
    
    setLastFeedback({ text: feedback || '', type: feedbackType });
    setGuess('');

    if (feedback !== 'Correct!') {
      setTimeout(() => {
        setLastFeedback((prev) => prev.type === 'correct' ? prev : { text: '', type: null });
      }, 3000);
    }
  };

  const VICTORY_QUOTES = [
    "The mind is sharper than any blade.",
    "A tactical masterclass in deduction!",
    "Prediction level: Legendary.",
    "The secret was no match for your intuition.",
    "Victory belongs to the most persevering.",
    "Calculated, precise, and absolutely dominant.",
    "The numbers have spoken, and you are the champion!",
    "A game of wits well won."
  ];

  const [victoryQuote, setVictoryQuote] = useState(VICTORY_QUOTES[0]);

    if (status === 'finished') {
      const randomQuote = VICTORY_QUOTES[Math.floor(Math.random() * VICTORY_QUOTES.length)];
      setTimeout(() => setVictoryQuote(randomQuote), 0);
    }
  }, [status, VICTORY_QUOTES]);

  if (status === 'setup' && !roomCode) return null;

  return (
    <main className="min-h-screen bg-slate-950 p-4 md:p-8 flex flex-col items-center">
      {/* Room Code Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
          <Sparkles className="text-white" size={20} />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Guessing Duel</h1>
      </div>

      <div className="mb-6 flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-sm">
        <Hash size={14} className="text-slate-500" />
        <span className="text-slate-500 font-bold uppercase tracking-tighter mr-1">Room:</span>
        <span className="text-white font-black tracking-widest">{roomCode}</span>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Game Area */}
        <div className="lg:col-span-7 space-y-8 relative">
          
          {/* Waiting for Opponent Overlay */}
          <AnimatePresence>
            {!isOpponentReady && status === 'playing' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-md rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800"
              >
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                  <Loader2 size={32} className="text-blue-500 animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Waiting for Opponent</h3>
                <p className="text-slate-400 max-w-xs">
                  Your opponent is still setting up their secret number. Hang tight!
                </p>
                <div className="mt-8 pt-8 border-t border-slate-800 w-full">
                  <p className="text-xs text-slate-500 uppercase font-black tracking-widest mb-4">Duel Code</p>
                  <div className="text-3xl font-black text-white tracking-widest">{roomCode}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ScoreBoard />
          
          <div className={`bg-slate-900/40 border-2 p-8 rounded-[2.5rem] backdrop-blur-md shadow-2xl relative overflow-hidden transition-all duration-500 ${
            isMyTurn && isOpponentReady ? 'border-blue-500/30' : 'border-slate-800 opacity-90'
          }`}>
            {/* Turn Indicator Bar */}
            <div className={`absolute top-0 left-0 w-full h-1.5 transition-all duration-500 ${
              currentTurn === 'player1' ? 'bg-blue-500' : 'bg-purple-500'
            }`} />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-8 flex flex-col items-center">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 ${
                  isMyTurn ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'
                }`}>
                  {isMyTurn ? 'Your Action' : 'Opponent Action'}
                </span>
                <h2 className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                  {isMyTurn ? 'Enter Your Guess' : 'Opponent is thinking...'}
                </h2>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={lastFeedback.text || (isMyTurn ? 'waiting' : 'thinking')}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className={`text-5xl font-black mb-10 min-h-[60px] flex items-center justify-center ${
                    lastFeedback.type === 'high' ? 'text-red-500' :
                    lastFeedback.type === 'low' ? 'text-blue-500' :
                    lastFeedback.type === 'correct' ? 'text-green-500' : 'text-slate-800'
                  }`}
                >
                  {lastFeedback.text || (isMyTurn ? "?" : <Loader2 className="animate-spin text-slate-800" size={40} />)}
                </motion.div>
              </AnimatePresence>

              <form onSubmit={handleGuess} className="w-full max-w-xs space-y-6">
                <Input
                  label=""
                  type="number"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="00"
                  className={`text-center text-5xl font-black h-24 rounded-3xl border-none shadow-inner transition-all ${
                    isMyTurn ? 'bg-slate-800/80' : 'bg-slate-900/30 text-slate-700'
                  }`}
                  disabled={!isMyTurn || status === 'finished' || !isOpponentReady}
                />
                
                <Button 
                  type="submit" 
                  size="lg" 
                  fullWidth 
                  disabled={!guess || !isMyTurn || status === 'finished' || !isOpponentReady}
                  className={`h-16 text-lg font-bold ${
                    playerId === 'player1' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  <Send size={20} className="mr-2" />
                  Launch Guess
                </Button>
              </form>

              <div className="flex gap-4 mt-12 w-full max-w-xs">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  fullWidth 
                  onClick={() => setIsRestartModalOpen(true)}
                  className="text-slate-600 hover:text-slate-300"
                >
                  <RotateCcw size={14} className="mr-1.5" /> Restart
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  fullWidth 
                  onClick={() => setIsGiveUpModalOpen(true)}
                  className="text-slate-600 hover:text-red-500"
                >
                  <LogOut size={14} className="mr-1.5" /> Forfeit
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-5 w-full h-full">
          <GuessHistory />
        </div>
      </div>

      {/* Win Modal */}
      <Modal isOpen={status === 'finished'} onClose={() => {}} title="Duel Result" showCloseButton={false}>
        <div className="flex flex-col items-center text-center p-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 border-4 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
          >
            <Trophy size={48} className="text-yellow-500" />
          </motion.div>
          
          <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">
            🎉 {winner ? gameState[winner].name : ''} Wins!
          </h2>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed italic">
            &quot;{victoryQuote}&quot;
          </p>

          <div className="bg-slate-950/50 rounded-[2rem] border border-slate-800 p-8 w-full mb-10 grid grid-cols-2 gap-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
            <div className="absolute top-0 right-0 w-1 h-full bg-purple-500/50" />
            
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">{player1.name}&apos;s Secret</p>
              <p className="text-4xl font-black text-white">{player1.secretNumber}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">{player2.name}&apos;s Secret</p>
              <p className="text-4xl font-black text-white">{player2.secretNumber}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Button size="lg" fullWidth onClick={resetGame} className="h-16 text-lg">
              <Sparkles size={20} className="mr-2" /> Rematch
            </Button>
            <Button variant="secondary" size="lg" fullWidth onClick={startNewGame} className="h-16 text-lg">
              Main Menu
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modals remain similar but updated with forfeit terminology */}
      {/* ... */}
    </main>
  );
}
