'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Hash, ShieldCheck, ArrowRight, ChevronLeft, Copy, Check, Loader2, Sparkles, Link as LinkIcon, Brain, HelpCircle } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { GameMode, GameDifficulty } from '@/types/game';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import AvatarDropdown from '@/components/ui/AvatarDropdown';
import { Capacitor } from '@capacitor/core';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import { LogOut, LogIn } from 'lucide-react';
import Modal from '@/components/ui/Modal';

export default function Setup() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center text-blue-500 transition-colors duration-300">
        <Loader2 className="animate-spin" size={48} />
      </div>
    }>
      <SetupContent />
    </React.Suspense>
  );
}

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { gameState, connectionStatus, createRoom, joinRoom, completeGuestSetup, startGame, startWithAI, startNewGame } = useGame();
  const { user, profileData, logout } = useAuth();
  const { roomCode, playerId, status, isOpponentPresent, isPlayer1Ready, isPlayer2Ready, range } = gameState;

  // New multi-step state management
  const [mode, setMode] = useState<'selection' | 'host-setup' | 'enter-code' | 'guest-setup' | 'lobby'>('selection');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  const [form, setForm] = useState({
    min: 1,
    max: 100,
    secret: '',
    mode: 'numeric' as GameMode,
    difficulty: 'easy' as GameDifficulty,
    wordLength: 5,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [guestPlayCount, setGuestPlayCount] = useState<number>(0);
  const [isValidating, setIsValidating] = useState(false);
  const [isDiffInfoOpen, setIsDiffInfoOpen] = useState(false);

  useEffect(() => {
    const count = localStorage.getItem('guestPlayCount');
    if (count) setGuestPlayCount(parseInt(count));
  }, []);

  // Pre-fill name from auth

  // Auto-join if room code in URL
  useEffect(() => {
    const room = searchParams.get('room');
    if (room && room.length === 6 && !roomCode && connectionStatus === 'connected') {
      console.log('Auto-joining room from URL:', room);
      if (user?.uid) {
        joinRoom(room.toUpperCase(), user.uid);
      } else {
        // Guest Logic
        if (guestPlayCount < 1) {
          const guestUid = `guest-${Math.random().toString(36).substring(2, 8)}`;
          joinRoom(room.toUpperCase(), guestUid);
        } else {
          // Gate the second-time guest
          setIsLoginModalOpen(true);
          setMode('enter-code');
          setJoinCode(room.toUpperCase());
        }
      }
    }
  }, [searchParams, joinRoom, roomCode, user?.uid, connectionStatus, guestPlayCount]);

  // Sync mode with game status for guest
  useEffect(() => {
    if (playerId === 'player2') {
      if (status === 'guest-setup') setTimeout(() => setMode('guest-setup'), 0);
      if (status === 'lobby') setTimeout(() => setMode('lobby'), 0);
    }
  }, [status, playerId]);

  // Auto-redirect to game when status changes to 'playing'
  useEffect(() => {
    if (status === 'playing') {
      router.push('/game');
    }
  }, [status, router]);

  // Clean up lobby on refresh/unload (Host only)
  useEffect(() => {
    const handleUnload = () => {
      if (mode === 'lobby' && playerId === 'player1') {
        startNewGame();
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [mode, playerId, startNewGame]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && guestPlayCount >= 1) {
      setIsLoginModalOpen(true);
      return;
    }
    const currentName = profileData?.name || 'Guest';
    const currentUid = user?.uid || `guest-${Math.random().toString(36).substring(2, 8)}`;
    
    if ((status === 'lobby' || status === 'playing' || status === 'guest-setup') && roomCode) {
      router.push('/game');
      return;
    }

    if (await validate()) {
      createRoom(
        currentName, 
        currentUid, 
        form.mode === 'numeric' ? parseInt(form.secret) : form.secret, 
        form.mode, 
        form.difficulty,
        form.mode === 'word' ? form.wordLength : undefined,
        form.min, 
        form.max
      );
      setMode('lobby');
    }
  };

  const handleJoinJoin = () => {
    if (!user && guestPlayCount >= 1) {
      setIsLoginModalOpen(true);
      return;
    }
    const currentUid = user?.uid || `guest-${Math.random().toString(36).substring(2, 8)}`;
    
    if ((status === 'lobby' || status === 'playing' || status === 'guest-setup') && roomCode) {
      router.push('/game');
      return;
    }
    
    if (joinCode.length === 6) {
      joinRoom(joinCode.toUpperCase(), currentUid);
    } else {
      setErrors({ join: 'Enter a valid 6-character code' });
    }
  };

  const handleGuestReady = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && guestPlayCount >= 1) {
      setIsLoginModalOpen(true);
      return;
    }
    const currentName = profileData?.name || 'Guest';
    const currentUid = user?.uid || `guest-${Math.random().toString(36).substring(2, 8)}`;

    if (await validate()) {
      completeGuestSetup(
        currentName, 
        currentUid, 
        gameState.mode === 'numeric' ? parseInt(form.secret) : form.secret
      );
      setMode('lobby');

      // Increment guest play count if unauthenticated
      if (!user) {
        const newCount = guestPlayCount + 1;
        setGuestPlayCount(newCount);
        localStorage.setItem('guestPlayCount', newCount.toString());
      }
    }
  };

  const copyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyInviteLink = () => {
    if (roomCode) {
      const origin = Capacitor.isNativePlatform() ? 'https://mindm.vercel.app' : window.location.origin;
      const url = `${origin}/setup?room=${roomCode}`;
      const hostName = profileData?.name || 'A player';
      const matchType = gameState.mode === 'numeric' ? 'Numbers Game' : 'Words Game';
      
      let details = '';
      if (gameState.mode === 'numeric') {
        const min = gameState.range?.min ?? 1;
        const max = gameState.range?.max ?? 100;
        const diff = gameState.difficulty === 'hard' ? 'Hard (Shifting Numbers)' : 'Easy (Static Number)';
        details = `🔢 Mode: ${matchType}\n📏 Range: ${min} - ${max}\n⚡️ Difficulty: ${diff}`;
      } else {
        const length = gameState.wordLength ?? 5;
        details = `🔤 Mode: ${matchType}\n📏 Word Length: ${length} letters`;
      }

      const message = `⚔️ ${hostName} has challenged you to a MindMatch!\n\n${details}\n\nJoin the arena here:\n${url}`;

      navigator.clipboard.writeText(message);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const isValidWord = async (word: string) => {
    try {
      const resp = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
      return resp.ok;
    } catch (e) {
      return true; // Fallback to true if API is down
    }
  };

  const validate = async () => {
    const newErrors: Record<string, string> = {};
    const currentMode = mode === 'host-setup' ? form.mode : gameState.mode;

    if (currentMode === 'numeric') {
      // Host range validation
      if (mode === 'host-setup') {
        if (form.min >= form.max) {
          newErrors.range = 'Min must be less than max';
        }
      }

      // Secret validation (against current range)
      const currentMin = mode === 'guest-setup' ? range.min : form.min;
      const currentMax = mode === 'guest-setup' ? range.max : form.max;
      
      const s = parseInt(form.secret);
      if (isNaN(s) || s < currentMin || s > currentMax) {
        newErrors.secret = `Must be between ${currentMin} and ${currentMax}`;
      }
    } else {
      // Word validation
      const targetLength = mode === 'guest-setup' ? gameState.wordLength : form.wordLength;
      if (!form.secret || form.secret.length !== targetLength) {
        newErrors.secret = `Must be exactly ${targetLength} letters`;
      } else if (!/^[A-Za-z]+$/.test(form.secret)) {
        newErrors.secret = 'Letters only, please';
      } else {
        setIsValidating(true);
        const valid = await isValidWord(form.secret);
        setIsValidating(false);
        if (!valid) {
          newErrors.secret = 'Not a valid English word';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const renderContent = () => {
    if (mode === 'selection') {
      return (
        <main className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent)] opacity-10 pointer-events-none" />
          <Navbar />
          <div className="flex-1 flex flex-col items-center justify-center p-6 pt-16 pb-20">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md space-y-8 relative z-10 text-center">
              <div className="space-y-4 text-center">
                <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-b from-foreground to-slate-500 bg-clip-text text-transparent">
                  GET READY!
                </h1>
                <p className="text-slate-400 text-sm">Choose your game mode to begin.</p>
              </div>

              {/* Game Mode Selection */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setForm({ ...form, mode: 'numeric' })}
                  className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 group ${
                    form.mode === 'numeric' 
                      ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                      : 'bg-card/40 border-card-border hover:border-slate-700'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    form.mode === 'numeric' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'
                  }`}>
                    <Hash size={24} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    form.mode === 'numeric' ? 'text-blue-400' : 'text-slate-500'
                  }`}>Numbers</span>
                </button>

                <button 
                  onClick={() => setForm({ ...form, mode: 'word' })}
                  className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 group ${
                    form.mode === 'word' 
                      ? 'bg-purple-600/10 border-purple-500/50 shadow-lg shadow-purple-500/10' 
                      : 'bg-card/40 border-card-border hover:border-slate-700'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    form.mode === 'word' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'
                  }`}>
                    <Brain size={24} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    form.mode === 'word' ? 'text-purple-400' : 'text-slate-500'
                  }`}>Words</span>
                </button>
              </div>

              <div className="grid gap-4 pt-2">
                <Button onClick={() => setMode('host-setup')} size="md" className="h-14 text-xs md:text-lg font-bold group whitespace-nowrap">
                  <Users className="mr-3 group-hover:scale-110 transition-transform" />
                  HOST A MindMatch
                </Button>
                <Button onClick={() => setMode('enter-code')} variant="secondary" size="md" className="h-14 text-xs md:text-lg font-bold group whitespace-nowrap">
                  <Hash className="mr-3 group-hover:scale-110 transition-transform" />
                  JOIN A MindMatch
                </Button>
              </div>
              <button onClick={() => router.push('/')} className="text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto">
                <ChevronLeft size={18} /> Cancel and Return
              </button>
            </motion.div>
          </div>
        </main>
      );
    }

    if (mode === 'enter-code') {
      return (
        <main className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent)] opacity-10 pointer-events-none" />
          <Navbar />
          <div className="flex-1 flex flex-col items-center justify-center p-6 pt-16 pb-20">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md space-y-8 relative z-10">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-black tracking-tight uppercase">ENTER <span className="normal-case">MindMatch</span> CODE</h2>
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed">Ask your friend for their unique 6-character code.</p>
              </div>
              <div className="space-y-4">
                <Input
                  label="Secret Code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. XJ7K2P"
                  id="join-code"
                  error={errors.join}
                  className="h-12 text-base font-mono tracking-widest text-center"
                  labelClassName="text-[10px]"
                />
                <Button fullWidth size="md" onClick={handleJoinJoin} className="h-14 font-black">
                  Find MindMatch
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </div>
              <button onClick={() => setMode('selection')} className="text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto text-xs font-bold uppercase tracking-widest pt-2">
                <ChevronLeft size={14} /> Cancel and Return
              </button>
            </motion.div>
          </div>
        </main>
      );
    }

    if (mode === 'host-setup') {
      return (
        <main className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent)] opacity-10 pointer-events-none" />
          <Navbar />
          <div className="flex-1 p-6 pb-20 overflow-y-auto">
            <div className="max-w-xl mx-auto space-y-8 pt-16 md:pt-24 text-center md:text-left">
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-black tracking-tight uppercase italic underline decoration-blue-500/30 underline-offset-8">MindMatch SETUP</h2>
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest pl-1 leading-relaxed">Configure your match settings before inviting a rival.</p>
              </div>
              <form onSubmit={handleCreateRoom} className="space-y-8 bg-card p-8 rounded-[2.5rem] border border-card-border backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                {form.mode === 'numeric' ? (
                  <section className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-3xl sm:rounded-2xl text-center sm:text-left">
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Difficulty</span>
                          <button 
                            type="button"
                            onClick={() => setIsDiffInfoOpen(true)}
                            className="text-blue-400/50 hover:text-blue-400 transition-colors"
                          >
                            <HelpCircle size={14} />
                          </button>
                        </div>
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Hard = Wrong guess adds +3 to rival</span>
                      </div>
                      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                        {(['easy', 'hard'] as const).map((diff) => (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => setForm({ ...form, difficulty: diff })}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                              form.difficulty === diff 
                                ? 'bg-blue-600 text-white shadow-lg' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Min Range" type="number" value={form.min} onChange={(e) => setForm({ ...form, min: parseInt(e.target.value) })} id="min" className="h-12 text-base font-bold" labelClassName="text-[10px]" />
                      <Input label="Max Range" type="number" value={form.max} onChange={(e) => setForm({ ...form, max: parseInt(e.target.value) })} id="max" error={errors.range} className="h-12 text-base font-bold" labelClassName="text-[10px]" />
                    </div>
                  </section>
                ) : (
                  <section className="space-y-4">
                    <div className="flex items-center justify-between gap-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Word Length</span>
                      <div className="flex gap-2">
                        {[4, 5, 6].map((len) => (
                          <button
                            key={len}
                            type="button"
                            onClick={() => setForm({ ...form, wordLength: len, secret: '' })}
                            className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${
                              form.wordLength === len 
                                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
                                : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {len}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                )}
                
                <section className="space-y-4">
                  <div className={`flex items-center gap-2 font-black uppercase tracking-[0.2em] text-[10px] ${
                    form.mode === 'numeric' ? 'text-green-400' : 'text-purple-400'
                  }`}>
                    <ShieldCheck size={14} className={form.mode === 'numeric' ? 'fill-green-400/10' : 'fill-purple-400/10'} /> 
                    Your Secret {form.mode === 'numeric' ? 'Number' : 'Word'}
                  </div>
                  <Input 
                    label={`Secret ${form.mode === 'numeric' ? 'Number' : 'Word'}`} 
                    type="password" 
                    showPasswordToggle 
                    value={form.secret} 
                    onChange={(e) => setForm({ ...form, secret: form.mode === 'numeric' ? e.target.value : e.target.value.toUpperCase().slice(0, form.wordLength) })} 
                    error={errors.secret} 
                    placeholder={form.mode === 'numeric' ? "e.g. 42" : `e.g. ${form.wordLength === 4 ? 'MIND' : form.wordLength === 5 ? 'MATCH' : 'WORDS'}`} 
                    id="secret" 
                    className="h-12 text-base font-bold tracking-[0.3em]" 
                    labelClassName="text-[10px]" 
                  />
                </section>
                <Button type="submit" size="lg" fullWidth className="h-16 text-xs md:text-base font-black uppercase tracking-widest whitespace-nowrap">
                  Create MindMatch
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </form>
              <button onClick={() => setMode('selection')} className="text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto text-xs font-bold uppercase tracking-widest pt-4">
                <ChevronLeft size={14} /> Cancel and Return
              </button>
            </div>
          </div>
        </main>
      );
    }

    if (mode === 'guest-setup') {
      return (
        <main className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent)] opacity-10 pointer-events-none" />
          <Navbar />
          <div className="flex-1 p-6 pb-20 overflow-y-auto">
            <div className="max-w-xl mx-auto space-y-8 pt-16 md:pt-24">
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-black tracking-tight uppercase italic underline decoration-blue-500/30 underline-offset-8">JOIN THE MindMatch</h2>
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest pl-1 leading-relaxed">A match has been found! Prepare yourself.</p>
              </div>
              <form onSubmit={handleGuestReady} className="space-y-8 bg-card p-8 rounded-[2.5rem] border border-card-border backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                {gameState.mode === 'numeric' ? (
                  <section className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-3xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Users className="text-blue-400" size={16} />
                      </div>
                      <span className="font-black text-blue-400 tracking-widest text-[10px] uppercase">MindMatch Range</span>
                    </div>
                    <div className="text-lg font-black text-foreground px-4 py-1.5 bg-blue-500/20 rounded-xl border border-blue-500/30">
                      {range.min} — {range.max}
                    </div>
                  </section>
                ) : (
                  <section className="bg-purple-500/10 border border-purple-500/20 p-5 rounded-3xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Brain className="text-purple-400" size={16} />
                      </div>
                      <span className="font-black text-purple-400 tracking-widest text-[10px] uppercase">Word Match Mode</span>
                    </div>
                    <div className="text-lg font-black text-foreground px-4 py-1.5 bg-purple-500/20 rounded-xl border border-purple-500/30">
                      {gameState.wordLength} LETTERS
                    </div>
                  </section>
                )}
                
                <section className="space-y-4">
                  <div className={`flex items-center gap-2 font-black uppercase tracking-[0.2em] text-[10px] ${
                    gameState.mode === 'numeric' ? 'text-green-400' : 'text-purple-400'
                  }`}>
                    <ShieldCheck size={14} className={gameState.mode === 'numeric' ? 'fill-green-400/10' : 'fill-purple-400/10'} /> 
                    Your Secret {gameState.mode === 'numeric' ? 'Number' : 'Word'}
                  </div>
                  <Input 
                    label={`Secret ${gameState.mode === 'numeric' ? 'Number' : 'Word'}`} 
                    type="password" 
                    showPasswordToggle 
                    value={form.secret} 
                    onChange={(e) => setForm({ ...form, secret: gameState.mode === 'numeric' ? e.target.value : e.target.value.toUpperCase().slice(0, gameState.wordLength) })} 
                    error={errors.secret} 
                    placeholder={gameState.mode === 'numeric' ? "e.g. 73" : `e.g. WORD`} 
                    id="secret" 
                    className="h-12 text-base font-bold tracking-[0.3em]" 
                    labelClassName="text-[10px]" 
                  />
                </section>
                <Button type="submit" size="lg" disabled={isValidating} fullWidth className="h-16 text-xs md:text-base font-black uppercase tracking-widest whitespace-nowrap">
                  {isValidating ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={20} />
                      Checking Word...
                    </>
                  ) : (
                    <>
                      Confirm & Ready
                      <ArrowRight className="ml-2" size={20} />
                    </>
                  )}
                </Button>
              </form>
              <button onClick={() => setMode('selection')} className="text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto text-xs font-bold uppercase tracking-widest pt-4">
                <ChevronLeft size={14} /> Cancel and Return
              </button>
            </div>
          </div>
        </main>
      );
    }

    if (mode === 'lobby') {
      const isBothReady = isPlayer1Ready && isPlayer2Ready;
      return (
        <main className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent)] opacity-10 pointer-events-none" />
          <Navbar />
          
          <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-lg mx-auto p-6 pt-2 md:pt-4 pb-32 space-y-4">
                  {/* Instructional Header */}
                  <div className="text-center">
                    <h1 className="text-xl md:text-2xl font-black tracking-tighter max-w-[280px] mx-auto md:max-w-none uppercase">
                      {playerId === 'player1' ? 'Invite your opponent to start the match.' : 'Wait for the host to signal the start.'}
                    </h1>
                  </div>

                  {/* Action Card Section */}
                  <div className="space-y-4">
                    {playerId === 'player1' && (
                      <div className="py-4 px-6 md:py-6 md:px-8 bg-card/40 border border-card-border rounded-[1.5rem] md:rounded-[2rem] backdrop-blur-md shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                        <div className="flex flex-col items-center gap-4 relative z-10">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Invite Your Rival</p>
                          
                          {/* Row 1: Code + Copy + Link */}
                          <div className="flex items-center gap-2 w-full max-w-[340px]">
                            <div className="flex-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl font-black text-xl md:text-2xl tracking-[0.2em] md:tracking-[0.3em] text-white shadow-inner flex items-center justify-center">
                              {roomCode}
                            </div>
                            <button 
                              onClick={copyCode}
                              className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all active:scale-95 group flex items-center justify-center"
                              title="Copy Code"
                            >
                              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="group-hover:rotate-12 transition-transform" />}
                            </button>
                            <button 
                              onClick={copyInviteLink}
                              className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all active:scale-95 group flex items-center justify-center"
                              title="Copy Invite Link"
                            >
                              {linkCopied ? <Check size={18} className="text-green-500" /> : <LinkIcon size={18} />}
                            </button>
                          </div>

                          {/* Row 2: AI Button (Full Width) */}
                          {!isOpponentPresent && (
                            <button 
                              onClick={() => {
                                if (!user && guestPlayCount >= 1) {
                                  setIsLoginModalOpen(true);
                                } else {
                                  const currentUid = user?.uid || `guest-${Math.random().toString(36).substring(2, 8)}`;
                                  const secretVal = form.mode === 'numeric' ? parseInt(form.secret) : form.secret;
                                  startWithAI(currentUid, form.mode, form.difficulty, secretVal, form.min, form.max, form.wordLength);
                                }
                              }}
                              className="w-full h-[52px] bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 hover:border-blue-500/30 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
                            >
                              <Sparkles size={16} className="group-hover:scale-110 transition-transform" />
                              MindMatch with AI
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Profiles Section */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 py-2 md:py-4">
                      {/* Profile Card */}
                      <div className="flex flex-col items-center gap-2 md:gap-4">
                        <div className="relative scale-90 md:scale-100">
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.8rem] md:rounded-[2.2rem] bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center border border-blue-500/30 shadow-2xl text-white font-black text-3xl md:text-4xl">
                            {(profileData?.name || 'G')?.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-7 md:h-7 bg-green-500 border-4 border-background rounded-full" />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-blue-500 mb-0.5 md:mb-1">Host</p>
                          <p className="text-sm md:text-base font-black text-white italic tracking-tight">{profileData?.name || 'You'}</p>
                        </div>
                      </div>

                      {/* Verses Separator */}
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center z-10">
                          <span className="text-xs md:text-sm font-black italic text-slate-500">VS</span>
                        </div>
                        <div className="h-[2px] w-20 md:w-28 bg-gradient-to-r from-transparent via-slate-700 to-transparent absolute" />
                      </div>

                      {/* Opponent Card */}
                      <div className="flex flex-col items-center gap-2 md:gap-4 relative">
                        <div className="relative scale-90 md:scale-100">
                          <div className={`w-20 h-20 md:w-24 md:h-24 rounded-[1.8rem] md:rounded-[2.2rem] flex items-center justify-center border transition-all duration-500 ${
                            isOpponentPresent 
                              ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 shadow-2xl text-white' 
                              : 'bg-slate-900/50 border-slate-800 border-dashed text-slate-800'
                          }`}>
                            {isOpponentPresent ? <Users size={30} /> : <Loader2 size={30} className="animate-spin opacity-20" />}
                          </div>
                          {isOpponentPresent && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-7 md:h-7 bg-green-500 border-4 border-background rounded-full" />
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-600 mb-0.5 md:mb-1">Rival</p>
                          <p className={`text-sm md:text-base font-black italic tracking-tight transition-colors ${
                            isOpponentPresent ? 'text-white' : 'text-slate-800'
                          }`}>
                            {isOpponentPresent ? 'MindMatchIST READY' : 'WAITING...'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {connectionStatus === 'failed' && (
                      <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl text-red-500 text-xs text-center font-bold">
                        ERROR: Could not connect to the real-time network. <br/>
                        Please check your Ably API Key in Vercel settings.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ready Status / Start Actions (Now fixed at bottom) */}
              <div className="p-6 md:px-8 bg-background/95 backdrop-blur-xl border-t border-card-border fixed bottom-0 left-0 right-0 z-50">
                <div className="max-w-lg mx-auto w-full">
                  {playerId === 'player1' ? (
                    <div className="flex flex-col items-center w-full gap-2">
                      <Button 
                        size="lg" 
                        fullWidth
                        disabled={!isOpponentPresent || !gameState.isPlayer2Ready}
                        onClick={startGame}
                        className="h-16 text-base font-black uppercase tracking-widest group bg-blue-600 hover:bg-blue-500 shadow-[0_0_30px_rgba(25,133,161,0.3)] disabled:opacity-50"
                      >
                        {!isOpponentPresent ? 'Waiting for Opponent...' : !gameState.isPlayer2Ready ? 'Opponent Setting Up...' : 'START MindMatch'}
                        {gameState.isPlayer2Ready && isOpponentPresent && <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />}
                      </Button>
                      {isOpponentPresent && !gameState.isPlayer2Ready && (
                        <p className="text-xs text-slate-500">Waiting for opponent to choose their secret number...</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 px-8 bg-blue-500/10 border border-blue-500/20 rounded-2xl w-full">
                      <Loader2 className="animate-spin text-blue-500 mx-auto mb-3" size={24} />
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Awaiting Host Signal...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
        </main>
      );
    }

    return null;
  };

  return (
    <>
      {renderContent()}
      <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} title="Login Required">
        <div className="space-y-6 text-center py-4">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-blue-500" size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase text-white">Guest Match Finished!</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              You&apos;ve used your free guest match. To continue playing, keep your stats, and climb the leaderboard, please create an account.
            </p>
          </div>
          <div className="space-y-3 pt-4">
            <Button fullWidth size="lg" onClick={() => router.push('/login')} className="bg-blue-600 hover:bg-blue-500 font-black">
              Login / Sign Up
            </Button>
            <button 
              onClick={() => setIsLoginModalOpen(false)}
              className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDiffInfoOpen} onClose={() => setIsDiffInfoOpen(false)} title="Numbers Difficulty">
        <div className="space-y-6 py-4">
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Easy mode
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              The classic MindMatch experience. Secret numbers stay static throughout the entire dual. Perfect for beginners or tactical precision.
            </p>
          </div>

          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Hard mode
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              A dynamic "Moving Target" challenge. Every time a participant makes a <span className="text-red-400 font-bold">wrong guess</span>, their opponent's secret number increases by <span className="text-red-400 font-bold">+3</span>.
            </p>
          </div>

          <div className="pt-2">
            <Button fullWidth size="md" onClick={() => setIsDiffInfoOpen(false)} className="bg-slate-800 hover:bg-slate-700 text-white font-black">
              Got it!
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
