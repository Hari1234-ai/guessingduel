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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [guestPlayCount, setGuestPlayCount] = useState<number>(0);

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
      }
    }
  }, [searchParams, joinRoom, roomCode, user?.uid, connectionStatus]);

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
    if (!user && guestPlayCount >= 1) {
      setIsLoginModalOpen(true);
      return;
    }
    const currentName = profileData?.name || 'Guest';
    const currentUid = user?.uid || `guest-${Math.random().toString(36).substring(2, 8)}`;
    
    if (validate()) {
      createRoom(currentName, currentUid, parseInt(form.secret), form.min, form.max);
      setMode('lobby');
    }
  };

  const handleJoinJoin = () => {
    if (!user && guestPlayCount >= 1) {
      setIsLoginModalOpen(true);
      return;
    }
    const currentUid = user?.uid || `guest-${Math.random().toString(36).substring(2, 8)}`;
    
    if (joinCode.length === 6) {
      joinRoom(joinCode.toUpperCase(), currentUid);
    } else {
      setErrors({ join: 'Enter a valid 6-character code' });
    }
  };

  const handleGuestReady = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && guestPlayCount >= 1) {
      setIsLoginModalOpen(true);
      return;
    }
    const currentName = profileData?.name || 'Guest';
    const currentUid = user?.uid || `guest-${Math.random().toString(36).substring(2, 8)}`;

    if (validate()) {
      completeGuestSetup(currentName, currentUid, parseInt(form.secret));
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
        <main className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent)] opacity-10 pointer-events-none" />
          <Navbar />
          <div className="flex-1 flex flex-col items-center justify-center p-6 pt-16 pb-20">
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

    if (mode === 'host-setup') {
      return (
        <main className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent)] opacity-10 pointer-events-none" />
          <Navbar />
          <div className="flex-1 p-6 pb-20 overflow-y-auto">
            <div className="max-w-xl mx-auto space-y-8 pt-16 md:pt-24 text-center md:text-left">
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-black tracking-tight uppercase italic underline decoration-blue-500/30 underline-offset-8">DUEL SETUP</h2>
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest pl-1 leading-relaxed">Configure your duel settings before inviting a rival.</p>
              </div>
              <form onSubmit={handleCreateRoom} className="space-y-8 bg-card p-8 rounded-[2.5rem] border border-card-border backdrop-blur-xl shadow-2xl relative overflow-hidden">
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

    if (mode === 'guest-setup') {
      return (
        <main className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent)] opacity-10 pointer-events-none" />
          <Navbar />
          <div className="flex-1 p-6 pb-20 overflow-y-auto">
            <div className="max-w-xl mx-auto space-y-8 pt-16 md:pt-24">
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-black tracking-tight uppercase italic underline decoration-blue-500/30 underline-offset-8">JOIN THE DUEL</h2>
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest pl-1 leading-relaxed">A duel has been found! Prepare yourself.</p>
              </div>
              <form onSubmit={handleGuestReady} className="space-y-8 bg-card p-8 rounded-[2.5rem] border border-card-border backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                <section className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="text-blue-400" size={16} />
                    </div>
                    <span className="font-black text-blue-400 tracking-widest text-[10px] uppercase">Duel Range</span>
                  </div>
                  <div className="text-lg font-black text-foreground px-4 py-1.5 bg-blue-500/20 rounded-xl border border-blue-500/30">
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

    if (mode === 'lobby') {
      const isBothReady = isPlayer1Ready && isPlayer2Ready;
      return (
        <main className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent)] opacity-10 pointer-events-none" />
          <Navbar />
          
          <div className="flex-1 p-6 pb-20 overflow-y-auto">
            <div className="max-w-lg mx-auto space-y-6 pt-2 md:pt-4">
              <div className="text-center space-y-4">
                <div className={`mx-auto inline-flex items-center gap-2 px-3 py-1 bg-card rounded-full border border-card-border text-[9px] font-black tracking-[0.2em] uppercase backdrop-blur-sm transition-all ${
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

                <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic max-w-[280px] mx-auto md:max-w-none">
                  {playerId === 'player1' ? 'Invite your opponent to start the duel.' : 'Wait for the host to signal the start.'}
                </h1>
                <div className="h-2" />
              </div>

              {/* Room Code & Sharing (Moved to Top) */}
              {playerId === 'player1' && (
                <div className="py-6 px-8 bg-card/40 border border-card-border rounded-[2rem] backdrop-blur-md shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                  <div className="flex flex-col items-center gap-4 relative z-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Invite Your Rival</p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <div className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl font-black text-2xl tracking-[0.3em] text-white shadow-inner">
                        {roomCode}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={copyCode}
                          className="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all active:scale-95 group"
                          title="Copy Code"
                        >
                          {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} className="group-hover:rotate-12 transition-transform" />}
                        </button>
                        <button 
                          onClick={copyInviteLink}
                          className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all active:scale-95 group"
                          title="Copy Invite Link"
                        >
                          {linkCopied ? <Check size={20} className="text-green-500" /> : <LinkIcon size={20} />}
                        </button>
                        {!isOpponentPresent && (
                          <button 
                            onClick={() => {
                              if (!user && guestPlayCount >= 1) {
                                setIsLoginModalOpen(true);
                              } else {
                                const currentUid = user?.uid || `guest-${Math.random().toString(36).substring(2, 8)}`;
                                startWithAI(currentUid);
                              }
                            }}
                            className="h-[58px] px-6 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 hover:border-blue-500/30 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group whitespace-nowrap"
                          >
                            <Sparkles size={16} className="group-hover:scale-110 transition-transform" />
                            Duel with AI
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {connectionStatus === 'failed' && (
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl text-red-500 text-xs text-center font-bold">
                  ERROR: Could not connect to the real-time network. <br/>
                  Please check your Ably API Key in Vercel settings.
                </div>
              )}

              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                  {/* Profile Card */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-[2.2rem] bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center border border-blue-500/30 shadow-2xl text-white font-black text-4xl">
                        {(profileData?.name || 'G')?.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 border-4 border-background rounded-full" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black uppercase tracking-widest text-blue-500 mb-1">Host</p>
                      <p className="text-base font-black text-white italic tracking-tight">{profileData?.name || 'You'}</p>
                    </div>
                  </div>

                  {/* Verses Separator */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                    <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center z-10">
                      <span className="text-sm font-black italic text-slate-500">VS</span>
                    </div>
                    <div className="h-[2px] w-28 bg-gradient-to-r from-transparent via-slate-700 to-transparent absolute" />
                  </div>

                  {/* Opponent Card */}
                  <div className="flex flex-col items-center gap-4 relative">
                    <div className="relative">
                      <div className={`w-24 h-24 rounded-[2.2rem] flex items-center justify-center border transition-all duration-500 ${
                        isOpponentPresent 
                          ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 shadow-2xl text-white' 
                          : 'bg-slate-900/50 border-slate-800 border-dashed text-slate-800'
                      }`}>
                        {isOpponentPresent ? <Users size={36} /> : <Loader2 size={36} className="animate-spin opacity-20" />}
                      </div>
                      {isOpponentPresent && (
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 border-4 border-background rounded-full" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-600 mb-1">Rival</p>
                      <p className={`text-base font-black italic tracking-tight transition-colors ${
                        isOpponentPresent ? 'text-white' : 'text-slate-800'
                      }`}>
                        {isOpponentPresent ? 'DUELIST READY' : 'WAITING...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ready Status / Start Actions */}
                <div className="pt-8 flex flex-col items-center gap-6">
                  {playerId === 'player1' ? (
                    <div className="flex flex-col items-center gap-4 w-full">
                      <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isOpponentPresent ? 'text-blue-400 animate-pulse' : 'text-slate-600'}`}>
                        {isOpponentPresent ? 'COMMUNICATION LINK ESTABLISHED' : 'BROADCASTING ARENA SIGNAL...'}
                      </p>
                      <Button 
                        size="lg" 
                        fullWidth={false}
                        disabled={!isOpponentPresent}
                        onClick={startGame}
                        className="h-16 px-12 text-base font-black uppercase tracking-widest group bg-blue-600 hover:bg-blue-500 shadow-[0_0_30px_rgba(255,87,188,0.3)]"
                      >
                        START DUEL
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
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
    </>
  );
}
