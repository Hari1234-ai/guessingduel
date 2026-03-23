'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RotateCcw, LogOut, Trophy, Sparkles, Loader2, Hash, Share2 } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ScoreBoard from '@/components/game/ScoreBoard';
import GuessHistory from '@/components/game/GuessHistory';
import AvatarDropdown from '@/components/ui/AvatarDropdown';
import Navbar from '@/components/ui/Navbar';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, increment, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { getISOWeek } from '@/lib/utils';

export default function Game() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const { gameState, makeGuess, resetGame, startNewGame, latestReaction, sendReaction } = useGame();
  const { player1, player2, currentTurn, status, winner, roomCode, playerId } = gameState;

  const [guess, setGuess] = useState('');
  const [lastFeedback, setLastFeedback] = useState<{ text: string, type: 'high' | 'low' | 'correct' | null }>({ text: '', type: null });
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const [isGiveUpModalOpen, setIsGiveUpModalOpen] = useState(false);
  const [opponentToast, setOpponentToast] = useState<{ show: boolean, guess: number, feedback: string, name: string }>({ 
    show: false, guess: 0, feedback: '', name: '' 
  });
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number, emoji: string, x: number }[]>([]);
  const emojiIdRef = useRef(0);
  const processedMatchRef = useRef<string | null>(null);
  const lastOpponentAttempts = useRef(0);

  const REACTION_EMOJIS = [
    { emoji: '🥳', label: 'Party' },
    { emoji: '💀', label: 'Skull' },
    { emoji: '💩', label: 'Poop' },
    { emoji: '😂', label: 'Joy' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😱', label: 'Shock' },
  ];

  // Listener for real-time reactions
  useEffect(() => {
    if (latestReaction) {
      const id = emojiIdRef.current++;
      const xOffset = Math.random() * 80 - 40; // Random horizontal spread
      setFloatingEmojis(prev => [...prev, { id, emoji: latestReaction.emoji, x: xOffset }]);
      
      // Remove after animation
      const timer = setTimeout(() => {
        setFloatingEmojis(prev => prev.filter(e => e.id !== id));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [latestReaction]);

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

  const VICTORY_QUOTES = React.useMemo(() => [
    "The mind is sharper than any blade.",
    "A tactical masterclass in deduction!",
    "Prediction level: Legendary.",
    "The secret was no match for your intuition.",
    "Victory belongs to the most persevering.",
    "Calculated, precise, and absolutely dominant.",
    "The numbers have spoken, and you are the champion!",
    "A game of wits well won."
  ], []);

  const [victoryQuote, setVictoryQuote] = useState(VICTORY_QUOTES[0]);

  useEffect(() => {
    if (status === 'finished' && winner && roomCode && processedMatchRef.current !== roomCode) {
      processedMatchRef.current = roomCode; // Lock immediately

      if (user && db) {
        const saveMatch = async () => {
          try {
            await addDoc(collection(db, 'matches'), {
              roomCode,
              winner,
              participants: [player1.uid, player2.uid],
              players: [
                { uid: player1.uid || '', name: player1.name, secretNumber: player1.secretNumber, guesses: player1.history },
                { uid: player2.uid || '', name: player2.name, secretNumber: player2.secretNumber, guesses: player2.history }
              ],
              createdAt: serverTimestamp()
            });
  
            // Reward coins to winner
            if (winner === playerId) {
              const currentWeek = getISOWeek();
              const userRef = doc(db, 'users', user.uid);
              const userSnap = await getDoc(userRef);
              
              if (userSnap.exists()) {
                const userData = userSnap.data();
                const needsWeeklyReset = userData.lastResetWeek !== currentWeek;
                
                await updateDoc(userRef, {
                  coins: increment(100),
                  weeklyCoins: needsWeeklyReset ? 100 : increment(100),
                  lastResetWeek: currentWeek,
                  updatedAt: serverTimestamp()
                });
                
                await refreshProfile();
              }
            }
          } catch (error) {
            console.error("Error saving match result & rewards:", error);
          }
        };
        saveMatch();
      } else {
        // Guest mode: Increment play count in localStorage
        const currentCount = parseInt(localStorage.getItem('guestPlayCount') || '0');
        localStorage.setItem('guestPlayCount', (currentCount + 1).toString());
      }
    }
  }, [status, winner, user, roomCode, player1, player2, playerId, refreshProfile]);
  
  const handleShare = async () => {
    const opponentId = playerId === 'player1' ? 'player2' : 'player1';
    const isWinner = winner === playerId;
    const p1Secret = playerId ? gameState[playerId as 'player1' | 'player2']?.secretNumber : 'N/A';
    const p2Secret = opponentId ? gameState[opponentId as 'player1' | 'player2']?.secretNumber : 'N/A';
    const shareText = `🎮 Just finished a Duel on Duel!\n${isWinner ? '🏆 I WON!' : '🥈 It was a close duel.'}\nMy secret: ${p1Secret} | Opponent's: ${p2Secret}\n\nJoin the arena: ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Duel Result',
          text: shareText,
          url: window.location.origin,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Result copied to clipboard! 📋');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // Opponent Guess Toast Logic
  useEffect(() => {
    const opponent = playerId === 'player1' ? player2 : player1;
    if (opponent.attempts > lastOpponentAttempts.current && opponent.history.length > 0) {
      const lastGuess = opponent.history[0];
      setOpponentToast({
        show: true,
        guess: lastGuess.guess,
        feedback: lastGuess.feedback || '',
        name: opponent.name
      });
      
      const timer = setTimeout(() => {
        setOpponentToast(prev => ({ ...prev, show: false }));
      }, 4000);
      
      lastOpponentAttempts.current = opponent.attempts;
      return () => clearTimeout(timer);
    }
  }, [player1.attempts, player2.attempts, player1.history, player2.history, player1.name, player2.name, playerId]);

  // Set victory quote once when game finishes
  useEffect(() => {
    if (status === 'finished' && winner) {
      const randomQuote = VICTORY_QUOTES[Math.floor(Math.random() * VICTORY_QUOTES.length)];
      setVictoryQuote(randomQuote);
    }
  }, [status, winner, VICTORY_QUOTES]);

  if (status === 'setup' && !roomCode) return null;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent)] opacity-10 pointer-events-none" />
      <Navbar />

      <div className="flex-1 p-4 md:p-8 pt-12 md:pt-16 flex flex-col items-center overflow-y-auto">
        {/* Target Range Line */}
        <div className="mb-6 flex items-center gap-2 px-4 py-1.5 bg-card border border-card-border rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 backdrop-blur-sm">
          Target Range: <span className="text-foreground">{gameState.range.min} — {gameState.range.max}</span>
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
                className="absolute inset-0 z-20 bg-background/80 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-card-border"
              >
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                  <Loader2 size={24} className="text-blue-500 animate-spin" />
                </div>
                <h3 className="text-xl font-bold mb-2">Waiting for Opponent</h3>
                <p className="text-slate-400 text-sm max-w-[200px]">
                  Your rival is still setting up.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <ScoreBoard />
          
          <div className={`bg-card border border-card-border p-6 rounded-[2rem] backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-500 ${
            isMyTurn && isOpponentReady ? 'border-blue-500/20' : 'opacity-80'
          }`}>
            {/* Turn Indicator Bar */}
            <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-500 ${
              currentTurn === 'player1' ? 'bg-blue-500' : 'bg-purple-500'
            }`} />

            {/* Turn Timer: Circular Progress */}
            <div className="absolute top-6 right-8 flex items-center justify-center w-16 h-16">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  fill="transparent"
                  className="text-foreground/5"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray="175.93"
                  animate={{ strokeDashoffset: 175.93 - (gameState.turnTimeLeft / 30) * 175.93 }}
                  className={`${gameState.turnTimeLeft <= 5 ? 'text-red-500' : isMyTurn ? 'text-blue-500' : 'text-purple-500'}`}
                />
              </svg>
              <div className={`absolute inset-0 flex items-center justify-center text-xl font-black ${gameState.turnTimeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {gameState.turnTimeLeft}
              </div>
            </div>

            <div className="relative z-10">
              <div className="mb-8 items-start text-left">
                <h2 className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mb-1">
                  {isMyTurn ? 'Your Action' : 'Duel Status'}
                </h2>
                <h3 className="text-foreground font-black uppercase tracking-tight text-lg italic">
                  {isMyTurn ? 'Enter Your Guess' : (player2.isAI ? 'AI is analyzing...' : 'Opponent is thinking...')}
                </h3>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={lastFeedback.text || (isMyTurn ? 'waiting' : 'thinking')}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className={`text-3xl font-black mb-8 min-h-[50px] flex items-center justify-center ${
                    lastFeedback.type === 'high' ? 'text-red-500' :
                    lastFeedback.type === 'low' ? 'text-blue-500' :
                    lastFeedback.type === 'correct' ? 'text-green-500' : 'text-slate-800'
                  }`}
                >
                  {lastFeedback.text || (isMyTurn ? "?" : <Loader2 className="animate-spin text-slate-800" size={30} />)}
                </motion.div>
              </AnimatePresence>

              <form onSubmit={handleGuess} className="w-full max-w-[200px] space-y-4 mx-auto">
                <div className="relative">
                  <Input
                    label=""
                    type="number"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="00"
                    className={`text-center text-4xl font-black h-20 rounded-2xl border-none shadow-inner transition-all ${
                      isMyTurn ? 'bg-card/80 ring-1 ring-card-border' : 'bg-card/30 text-slate-700'
                    }`}
                    disabled={!isMyTurn || status === 'finished' || !isOpponentReady}
                  />
                  {isMyTurn && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_#FF57BC]"
                    />
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  size="md" 
                  fullWidth 
                  disabled={!guess || !isMyTurn || status === 'finished' || !isOpponentReady}
                  className={`h-12 text-xs font-black uppercase tracking-[0.2em] ${
                    playerId === 'player1' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  Confirm Guess
                  <Send size={14} className="ml-2" />
                </Button>
              </form>

              <div className="mt-10 w-full relative">
                {/* Floating Emojis Container */}
                <div className="absolute -top-40 inset-x-0 pointer-events-none z-50">
                  <AnimatePresence>
                    {floatingEmojis.map((e) => (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, y: 100, x: e.x, scale: 0.5 }}
                        animate={{ opacity: [0, 1, 1, 0], y: -300, scale: [0.5, 1.5, 1.5, 2] }}
                        transition={{ duration: 2.5, ease: "easeOut" }}
                        className="absolute left-1/2 -translate-x-1/2 text-4xl select-none mx-auto"
                      >
                        {e.emoji}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Emoji Selection Bar */}
                <div className="flex items-center justify-between w-full p-3 bg-card/60 rounded-2xl border border-card-border backdrop-blur-md shadow-lg px-6">
                  {REACTION_EMOJIS.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => sendReaction(item.emoji)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-all active:scale-90 text-xl"
                      title={item.label}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-8 w-full max-w-xs">
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
            className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 border-2 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
          >
            <Trophy size={32} className="text-yellow-500" />
          </motion.div>
          
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
            🎉 {winner ? gameState[winner].name : ''} Wins!
          </h2>
          
          {winner === playerId && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-4 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
            >
              <Sparkles size={14} className="text-yellow-500" />
              <span className="text-xs font-black text-yellow-500 uppercase tracking-widest">+100 Coins Reward Added</span>
            </motion.div>
          )}

          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            &quot;{victoryQuote}&quot;
          </p>

          <div className="bg-slate-950/50 rounded-2xl border border-slate-800 p-6 w-full mb-8 grid grid-cols-2 gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
            <div className="absolute top-0 right-0 w-1 h-full bg-purple-500/50" />
            
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{player1.name}&apos;s Secret</p>
              <p className="text-2xl font-black text-white">{player1.secretNumber}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{player2.name}&apos;s Secret</p>
              <p className="text-2xl font-black text-white">{player2.secretNumber}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Button 
              onClick={handleShare}
              className="h-12 text-sm font-black bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              fullWidth
            >
              <Share2 size={16} />
              Share Result
            </Button>
            <Button 
              variant="secondary" 
              size="md" 
              fullWidth 
              onClick={() => {
                const code = roomCode;
                const isAI = player2.isAI;
                startNewGame();
                if (isAI || !code) {
                  router.push('/setup');
                } else {
                  router.push(`/setup?room=${code}`);
                }
              }} 
              className="h-12 text-sm text-slate-400"
            >
              Main Menu
            </Button>
          </div>
        </div>
      </Modal>

      {/* Restart Confirmation Modal */}
      <Modal isOpen={isRestartModalOpen} onClose={() => setIsRestartModalOpen(false)} title="Restart Game?">
        <div className="p-4 text-center">
          <p className="text-slate-400 mb-6 text-sm">This will reset progress for all players. Are you sure?</p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setIsRestartModalOpen(false)} className="h-10 text-xs">Cancel</Button>
            <Button fullWidth onClick={() => { resetGame(); setIsRestartModalOpen(false); }} className="bg-red-600 hover:bg-red-700 h-10 text-xs">Yes, Restart</Button>
          </div>
        </div>
      </Modal>

      {/* Give Up Confirmation Modal */}
      <Modal isOpen={isGiveUpModalOpen} onClose={() => setIsGiveUpModalOpen(false)} title="Forfeit Match?">
        <div className="p-4 text-center">
          <p className="text-slate-400 mb-6 text-sm">Are you sure you want to forfeit this duel? Your rival will win immediately.</p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setIsGiveUpModalOpen(false)} className="h-10 text-xs">Stay in Duel</Button>
            <Button fullWidth onClick={() => { setIsGiveUpModalOpen(false); startNewGame(); }} className="bg-red-600 hover:bg-red-700 h-10 text-xs">Forfeit Match</Button>
          </div>
        </div>
      </Modal>
      </div>

      {/* Opponent Guess Toast */}
      <AnimatePresence>
        {opponentToast.show && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm md:hidden"
          >
            <div className="bg-slate-900/90 border border-white/10 backdrop-blur-xl p-4 rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                  opponentToast.feedback === 'Too High' ? 'bg-red-500/20 text-red-500' : 
                  opponentToast.feedback === 'Too Low' ? 'bg-blue-500/20 text-blue-500' :
                  'bg-green-500/20 text-green-500'
                }`}>
                  {opponentToast.guess}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{opponentToast.name} Guessed</p>
                  <p className="text-white font-black text-sm uppercase italic">{opponentToast.feedback}</p>
                </div>
              </div>
              <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                  opponentToast.feedback === 'Too High' ? 'text-red-400' : 
                  opponentToast.feedback === 'Too Low' ? 'text-blue-400' :
                  'text-green-400'
              }`}>
                {opponentToast.feedback === 'Too High' ? 'High' : opponentToast.feedback === 'Too Low' ? 'Low' : 'Correct'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
