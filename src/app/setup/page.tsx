'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Hash, ShieldCheck, ArrowRight, ChevronLeft, Copy, Check, Info, Loader2, Sparkles, Link as LinkIcon } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

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
  const { gameState, connectionStatus, createRoom, joinRoom, completeGuestSetup, startGame } = useGame();
  const { roomCode, playerId, status, isOpponentPresent, isPlayer1Ready, isPlayer2Ready, range } = gameState;

  // New multi-step state management
  const [mode, setMode] = useState<'selection' | 'host-setup' | 'enter-code' | 'guest-setup' | 'lobby'>('selection');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    min: 1,
    max: 100,
    secret: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-join if room code in URL
  useEffect(() => {
    const room = searchParams.get('room');
    if (room && room.length === 6 && !roomCode) {
      console.log('Auto-joining room from URL:', room);
      joinRoom(room.toUpperCase());
    }
  }, [searchParams, joinRoom, roomCode]);

  // Sync mode with game status for guest
  useEffect(() => {
    if (playerId === 'player2') {
      if (status === 'guest-setup') setMode('guest-setup');
      if (status === 'lobby') setMode('lobby');
    }
  }, [status, playerId]);

  // Auto-redirect to game when status changes to 'playing'
  useEffect(() => {
    if (status === 'playing') {
      router.push('/game');
    }
  }, [status, router]);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      createRoom(form.name, parseInt(form.secret), form.min, form.max);
      setMode('lobby');
    }
  };

  const handleJoinJoin = () => {
    if (joinCode.length === 6) {
      joinRoom(joinCode.toUpperCase());
    } else {
      setErrors({ join: 'Enter a valid 6-character code' });
    }
  };

  const handleGuestReady = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      completeGuestSetup(form.name, parseInt(form.secret));
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

  // 1. SELECTION VIEW
  if (mode === 'selection') {
    return (
      <main className="min-h-screen bg-[#050B18] text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1e293b,transparent)] opacity-20" />
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md space-y-8 relative z-10 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tighter sm:text-6xl bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
              GET READY!
            </h1>
            <p className="text-slate-400 text-lg">Choose your side to begin the duel.</p>
          </div>
          <div className="grid gap-4 pt-8">
            <Button onClick={() => setMode('host-setup')} size="lg" className="h-20 text-xl font-bold group">
              <Users className="mr-3 group-hover:scale-110 transition-transform" />
              HOST A DUEL
            </Button>
            <Button onClick={() => setMode('enter-code')} variant="secondary" size="lg" className="h-20 text-xl font-bold group">
              <Hash className="mr-3 group-hover:scale-110 transition-transform" />
              JOIN A DUEL
            </Button>
          </div>
          <button onClick={() => router.push('/')} className="text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto">
            <ChevronLeft size={18} /> Cancel and Return
          </button>
        </motion.div>
      </main>
    );
  }

  // 2. JOIN CODE VIEW
  if (mode === 'enter-code') {
    return (
      <main className="min-h-screen bg-[#050B18] text-white p-6 flex flex-col items-center justify-center">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md space-y-8">
          <button onClick={() => setMode('selection')} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2">
            <ChevronLeft size={18} /> Back
          </button>
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black">ENTER DUEL CODE</h2>
            <p className="text-slate-400">Ask your friend for their unique 6-character code.</p>
          </div>
          <div className="space-y-4">
            <Input
              label="Secret Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. XJ7K2P"
              id="join-code"
              error={errors.join}
            />
            <Button fullWidth size="lg" onClick={handleJoinJoin}>
              Find Duel
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  // 3. HOST SETUP VIEW
  if (mode === 'host-setup') {
    return (
      <main className="min-h-screen bg-[#050B18] text-white p-6">
        <div className="max-w-xl mx-auto space-y-8 pt-12">
          <button onClick={() => setMode('selection')} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2">
            <ChevronLeft size={18} /> Back
          </button>
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight">DUEL SETUP</h2>
            <p className="text-slate-400">Configure your duel settings before inviting a rival.</p>
          </div>
          <form onSubmit={handleCreateRoom} className="space-y-8 bg-slate-900/30 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-sm shadow-2xl">
            <section className="space-y-4">
              <Input label="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Maverick" id="name" />
              <div className="flex gap-4">
                <Input label="Min Range" type="number" value={form.min} onChange={(e) => setForm({ ...form, min: parseInt(e.target.value) })} id="min" />
                <Input label="Max Range" type="number" value={form.max} onChange={(e) => setForm({ ...form, max: parseInt(e.target.value) })} id="max" error={errors.range} />
              </div>
            </section>
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-green-400 font-bold uppercase tracking-wider text-sm">
                <ShieldCheck size={18} /> Your Secret Number
              </div>
              <Input label="Secret Number" type="password" showPasswordToggle value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })} error={errors.secret} placeholder="e.g. 42" id="secret" />
            </section>
            <Button type="submit" size="lg" fullWidth className="h-16 text-lg">
              Create Duel
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </form>
        </div>
      </main>
    );
  }

  // 4. GUEST SETUP VIEW
  if (mode === 'guest-setup') {
    return (
      <main className="min-h-screen bg-[#050B18] text-white p-6">
        <div className="max-w-xl mx-auto space-y-8 pt-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight uppercase">JOIN THE DUEL</h2>
            <p className="text-slate-400">A duel has been found! Prepare yourself.</p>
          </div>
          <form onSubmit={handleGuestReady} className="space-y-8 bg-slate-900/30 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-sm shadow-2xl">
             <section className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="text-blue-400" />
                <span className="font-bold text-blue-400 tracking-wide">HOST RANGE</span>
              </div>
              <div className="text-xl font-black text-white px-4 py-1 bg-blue-500/20 rounded-full">
                {range.min} - {range.max}
              </div>
            </section>
            <section className="space-y-4">
              <Input label="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Iceman" id="name" />
            </section>
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-green-400 font-bold uppercase tracking-wider text-sm">
                <ShieldCheck size={18} /> Your Secret Number
              </div>
              <Input label="Secret Number" type="password" showPasswordToggle value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })} error={errors.secret} placeholder="e.g. 73" id="secret" />
            </section>
            <Button type="submit" size="lg" fullWidth className="h-16 text-lg">
              Confirm & Ready
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </form>
        </div>
      </main>
    );
  }

  // 5. LOBBY VIEW
  if (mode === 'lobby') {
    const isBothReady = isPlayer1Ready && isPlayer2Ready;
    
    return (
      <main className="min-h-screen bg-[#050B18] text-white p-6 flex items-center justify-center">
        {/* Connection Status Indicator */}
        <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-full border border-white/5 text-[10px] font-bold tracking-widest uppercase">
          <div className={`w-1.5 h-1.5 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
            'bg-red-500 shadow-[0_0_8px_#ef4444]'
          }`} />
          {connectionStatus}
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-lg space-y-12">
          <div className="text-center space-y-4">
            <div className="bg-blue-500/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
              <Users className="text-blue-400" size={32} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter">DUEL LOBBY</h1>
            <p className="text-slate-400">Everything is set. {playerId === 'player1' ? 'Invite your opponent.' : 'Wait for the host to start.'}</p>
          </div>

          {connectionStatus === 'failed' && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl text-red-500 text-xs text-center font-bold">
              ERROR: Could not connect to the real-time network. <br/>
              Please check your Ably API Key in Vercel settings.
            </div>
          )}

          {playerId === 'player1' && (
            <div className="bg-slate-900 border border-white/10 p-8 rounded-[3rem] text-center space-y-6 shadow-2xl relative">
              <div className="space-y-2">
                <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Room Identification Code</span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-6xl font-black tracking-widest text-white font-mono">{roomCode}</span>
                  <button onClick={copyCode} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors">
                    {copied ? <Check size={24} className="text-green-400" /> : <Copy size={24} className="text-slate-400" />}
                  </button>
                </div>
              </div>
              
              <button 
                onClick={copyInviteLink}
                className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/20 transition-all group w-full max-w-[280px]"
              >
                {linkCopied ? (
                  <>
                    <Check size={18} className="text-green-400" />
                    <span className="font-bold text-sm">COPIED LINK!</span>
                  </>
                ) : (
                  <>
                    <LinkIcon size={18} className="group-hover:rotate-12 transition-transform" />
                    <span className="font-bold text-sm uppercase tracking-wide">Copy Invite Link</span>
                  </>
                )}
              </button>

              {!isOpponentPresent && (
                <div className="flex items-center justify-center gap-2 text-blue-400 font-bold animate-pulse text-sm">
                  <Loader2 className="animate-spin" size={16} /> Waiting for opponent to join...
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
        </motion.div>
      </main>
    );
  }

  return null;
}
