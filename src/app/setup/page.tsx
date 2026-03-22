'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Hash, ShieldCheck, ArrowRight, ChevronLeft, Copy, Check, Loader2, Sparkles, Link as LinkIcon, Swords } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import AvatarDropdown from '@/components/ui/AvatarDropdown';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import { LogOut } from 'lucide-react';

export default function Setup() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#050B18] flex items-center justify-center text-blue-500">
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
  });

  const [lobbyTimer, setLobbyTimer] = useState(30);

  // Lobby timeout countdown (Host only)
  useEffect(() => {
    if (mode === 'lobby' && playerId === 'player1' && !isOpponentPresent && lobbyTimer > 0) {
      const timer = setInterval(() => {
        setLobbyTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, playerId, isOpponentPresent, lobbyTimer]);

  // Handle timeout expiry
  useEffect(() => {
    if (mode === 'lobby' && playerId === 'player1' && !isOpponentPresent && lobbyTimer === 0) {
      startNewGame(); // Resets context
      setMode('selection');
      setLobbyTimer(30);
    }
  }, [lobbyTimer, mode, playerId, isOpponentPresent, startNewGame]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill name from auth

  // Auto-join if room code in URL
  useEffect(() => {
    const room = searchParams.get('room');
    if (room && room.length === 6 && !roomCode) {
      console.log('Auto-joining room from URL:', room);
      if (user?.uid) {
        joinRoom(room.toUpperCase(), user.uid);
      }
    }
  }, [searchParams, joinRoom, roomCode]);

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

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && profileData?.name && user?.uid) {
      createRoom(profileData.name, user.uid, parseInt(form.secret), form.min, form.max);
      setMode('lobby');
    }
  };

  const handleJoinJoin = () => {
    if (joinCode.length === 6 && user?.uid) {
      joinRoom(joinCode.toUpperCase(), user.uid);
    } else {
      setErrors({ join: 'Enter a valid 6-character code' });
    }
  };

  const handleGuestReady = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && profileData?.name && user?.uid) {
      completeGuestSetup(profileData.name, user.uid, parseInt(form.secret));
      setMode('lobby');
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
      const url = `${window.location.origin}/setup?room=${roomCode}`;
      navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (mode === 'selection') {
    return (
      <main className="min-h-screen bg-[#050B18] text-white flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1e293b,transparent)] opacity-20 pointer-events-none" />
        
        <Navbar />

        <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md space-y-8 relative z-10 text-center">
            <div className="space-y-4 text-center">
            <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
              GET READY!
            </h1>
            <p className="text-slate-400 text-sm">Choose your side to begin the duel.</p>
          </div>
          <div className="grid gap-4 pt-6">
            <Button onClick={() => setMode('host-setup')} size="md" className="h-14 text-lg font-bold group">
              <Users className="mr-3 group-hover:scale-110 transition-transform" />
              HOST A DUEL
            </Button>
            <Button onClick={() => setMode('enter-code')} variant="secondary" size="md" className="h-14 text-lg font-bold group">
              <Hash className="mr-3 group-hover:scale-110 transition-transform" />
              JOIN A DUEL
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
      <main className="min-h-screen bg-[#050B18] text-white flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1e293b,transparent)] opacity-10 pointer-events-none" />
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md space-y-8 relative z-10">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black uppercase italic tracking-tight">ENTER DUEL CODE</h2>
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
                Find Duel
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

  // 3. HOST SETUP VIEW
  if (mode === 'host-setup') {
    return (
      <main className="min-h-screen bg-[#050B18] text-white flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent)] opacity-10 pointer-events-none" />
        <Navbar />
        <div className="flex-1 p-6 pb-20 overflow-y-auto">
          <div className="max-w-xl mx-auto space-y-8 pt-8 md:pt-12 text-center md:text-left">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-black tracking-tight uppercase italic underline decoration-blue-500/30 underline-offset-8">DUEL SETUP</h2>
              <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest pl-1 leading-relaxed">Configure your duel settings before inviting a rival.</p>
            </div>
            <form onSubmit={handleCreateRoom} className="space-y-8 bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
              <section className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Min Range" type="number" value={form.min} onChange={(e) => setForm({ ...form, min: parseInt(e.target.value) })} id="min" className="h-12 text-base font-bold" labelClassName="text-[10px]" />
                  <Input label="Max Range" type="number" value={form.max} onChange={(e) => setForm({ ...form, max: parseInt(e.target.value) })} id="max" error={errors.range} className="h-12 text-base font-bold" labelClassName="text-[10px]" />
                </div>
              </section>
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-green-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  <ShieldCheck size={14} className="fill-green-400/10" /> Your Secret Number
                </div>
                <Input label="Secret Number" type="password" showPasswordToggle value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })} error={errors.secret} placeholder="e.g. 42" id="secret" className="h-12 text-base font-bold tracking-[0.3em]" labelClassName="text-[10px]" />
              </section>
              <Button type="submit" size="lg" fullWidth className="h-16 text-base font-black uppercase tracking-widest">
                Create Duel
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

  // 4. GUEST SETUP VIEW
  if (mode === 'guest-setup') {
    return (
      <main className="min-h-screen bg-[#050B18] text-white flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent)] opacity-10 pointer-events-none" />
        <Navbar />
        <div className="flex-1 p-6 pb-20 overflow-y-auto">
          <div className="max-w-xl mx-auto space-y-8 pt-8 md:pt-12">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-black tracking-tight uppercase italic underline decoration-blue-500/30 underline-offset-8">JOIN THE DUEL</h2>
              <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest pl-1 leading-relaxed">A duel has been found! Prepare yourself.</p>
            </div>
            <form onSubmit={handleGuestReady} className="space-y-8 bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
               <section className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-400" size={16} />
                  </div>
                  <span className="font-black text-blue-400 tracking-widest text-[10px] uppercase">Duel Range</span>
                </div>
                <div className="text-lg font-black text-white px-4 py-1.5 bg-blue-500/20 rounded-xl border border-blue-500/30">
                  {range.min} — {range.max}
                </div>
              </section>
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-green-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  <ShieldCheck size={14} className="fill-green-400/10" /> Your Secret Number
                </div>
                <Input label="Secret Number" type="password" showPasswordToggle value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })} error={errors.secret} placeholder="e.g. 73" id="secret" className="h-12 text-base font-bold tracking-[0.3em]" labelClassName="text-[10px]" />
              </section>
              <Button type="submit" size="lg" fullWidth className="h-16 text-base font-black uppercase tracking-widest">
                Confirm & Ready
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

  // 5. LOBBY VIEW
  if (mode === 'lobby') {
    const isBothReady = isPlayer1Ready && isPlayer2Ready;
    
    return (
      <main className="min-h-screen bg-[#050B18] text-white flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent)] opacity-10 pointer-events-none" />
        <Navbar />
        
        <div className="flex-1 p-6 pb-20 overflow-y-auto">
          <div className="max-w-lg mx-auto space-y-10 pt-4 md:pt-8">
          <div className="text-center space-y-4">
            {/* Connection Status Indicator */}
            <div className={`mx-auto inline-flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-full border border-white/5 text-[9px] font-black tracking-[0.2em] uppercase backdrop-blur-sm transition-all ${
              connectionStatus === 'connected' ? 'text-green-500/80' : 
              connectionStatus === 'connecting' ? 'text-yellow-500/80' : 
              'text-red-500/80'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                'bg-red-500 shadow-[0_0_8px_#ef4444]'
              }`} />
              {connectionStatus}
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">Lobby</h1>
            <p className="text-slate-500 text-xs md:text-sm max-w-[280px] mx-auto md:max-w-none">
              {playerId === 'player1' ? 'Invite your opponent to start the duel.' : 'Wait for the host to signal the start.'}
            </p>
          </div>

          {connectionStatus === 'failed' && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl text-red-500 text-xs text-center font-bold">
              ERROR: Could not connect to the real-time network. <br/>
              Please check your Ably API Key in Vercel settings.
            </div>
          )}

          {playerId === 'player1' && (
            <div className="bg-slate-900/50 border border-white/5 p-6 md:p-10 rounded-[2.5rem] text-center space-y-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
              
              <div className="space-y-3">
                <span className="text-[10px] font-black tracking-[0.3em] text-slate-600 uppercase">Identification Code</span>
                <div className="flex items-center justify-center gap-2 md:gap-4">
                  <span className="text-4xl md:text-6xl font-black tracking-[0.2em] text-white font-mono drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    {roomCode}
                  </span>
                  <button onClick={copyCode} className="p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-95">
                    {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} className="text-slate-500 group-hover:text-blue-400 transition-colors" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-white/5">
                <button 
                  onClick={copyInviteLink}
                  className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/20 transition-all group w-full"
                >
                  {linkCopied ? (
                    <>
                      <Check size={16} className="text-green-400" />
                      <span className="font-bold text-xs uppercase">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon size={16} className="group-hover:rotate-12 transition-transform" />
                      <span className="font-bold text-xs uppercase tracking-widest">Copy Invite Link</span>
                    </>
                  )}
                </button>
              </div>

              {!isOpponentPresent && (
                <div className="space-y-6 pt-6 border-t border-white/5">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center justify-center gap-2 text-blue-400/60 font-medium animate-pulse text-[11px] uppercase tracking-widest">
                      <Loader2 className="animate-spin" size={14} /> Waiting for rival...
                    </div>
                    <div className="mx-auto flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                      <span className={`text-[9px] font-black tracking-widest ${lobbyTimer <= 10 ? 'text-red-500 animate-pulse' : 'text-blue-400/80'}`}>
                        AUTO-CLOSE IN {lobbyTimer}S
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Button 
                      onClick={() => user?.uid && startWithAI(user.uid)}
                      size="lg"
                      className="w-full h-16 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-blue-400 border border-blue-500/20 hover:border-blue-500/40 rounded-3xl transition-all group relative overflow-hidden backdrop-blur-sm"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <Sparkles size={20} className="mr-3 group-hover:scale-110 group-hover:rotate-12 transition-transform text-blue-400" />
                      <div className="flex flex-col items-start">
                        <span className="font-black tracking-[0.2em] uppercase text-[10px] leading-tight opacity-60">Practice Duel</span>
                        <span className="font-black tracking-widest uppercase text-sm leading-tight">DUEL WITH AI</span>
                      </div>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
             {/* Readiness Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-6 rounded-[2rem] border-2 text-center transition-all ${isPlayer1Ready ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-900 border-slate-800'}`}>
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Host</div>
                <div className="font-black truncate">{gameState.player1.name}</div>
                <div className={`mt-2 text-[10px] font-black uppercase ${isPlayer1Ready ? 'text-green-400' : 'text-slate-600'}`}>
                  {isPlayer1Ready ? 'READY' : 'PREPARING'}
                </div>
              </div>
              <div className={`p-6 rounded-[2rem] border-2 text-center transition-all ${isPlayer2Ready ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-900 border-slate-800'}`}>
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Challenger</div>
                <div className="font-black truncate">{isOpponentPresent ? gameState.player2.name : '???'}</div>
                <div className={`mt-2 text-[10px] font-black uppercase ${isPlayer2Ready ? 'text-green-400' : 'text-slate-600'}`}>
                  {isPlayer2Ready ? 'READY' : 'WAITING'}
                </div>
              </div>
            </div>

            {isBothReady ? (
              playerId === 'player1' ? (
                <Button size="lg" fullWidth onClick={startGame} className="h-20 text-xl font-black bg-blue-600 hover:bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all">
                  <Sparkles className="mr-2" /> START THE DUEL
                </Button>
              ) : (
                <div className="bg-slate-900/50 border-2 border-slate-800 p-6 rounded-3xl text-center space-y-3">
                  <div className="flex items-center justify-center gap-3 text-blue-400 font-bold animate-pulse">
                    <Loader2 className="animate-spin" size={20} />
                    Waiting for Host to start...
                  </div>
                  <p className="text-slate-500 text-xs text-center">Both players are locked in. Host will signal the start.</p>
                </div>
              )
            ) : isPlayer2Ready ? (
              <div className="text-center text-slate-500 font-bold animate-pulse p-4">Waiting for remaining player...</div>
            ) : null}
          </div>

          <button onClick={() => router.push('/')} className="text-slate-600 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto text-sm font-bold uppercase tracking-widest">
            Cancel and Return
          </button>
        </div>
      </div>
    </main>
    );
  }

  return null;
}
