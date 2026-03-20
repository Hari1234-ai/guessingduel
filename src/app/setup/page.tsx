'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Hash, ShieldCheck, ArrowRight, ChevronLeft, Copy, Check, Info, Loader2, Sparkles } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function Setup() {
  const router = useRouter();
  const { gameState, createRoom, joinRoom, setSetup, startGame } = useGame();
  const { roomCode, playerId, status, isOpponentPresent, isPlayer1Ready, isPlayer2Ready } = gameState;

  const [mode, setMode] = useState<'selection' | 'host' | 'join'>('selection');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    min: 1,
    max: 100,
    secret: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-redirect to game when status changes to 'playing'
  useEffect(() => {
    if (status === 'playing') {
      router.push('/game');
    }
  }, [status, router]);

  // Auto-transition from Lobby to Setup when opponent joins
  useEffect(() => {
    if (status === 'lobby' && isOpponentPresent) {
      setMode('host'); 
    }
  }, [status, isOpponentPresent]);

  // Reset form name based on default if empty
  useEffect(() => {
    if (!form.name) {
      setForm(prev => ({ ...prev, name: playerId === 'player1' ? 'Player 1' : 'Player 2' }));
    }
  }, [playerId, form.name]);

  const handleCreateRoom = () => {
    createRoom();
    setMode('host');
  };

  const handleJoinRoom = () => {
    if (joinCode.length === 6) {
      joinRoom(joinCode.toUpperCase());
      setMode('join');
    } else {
      setErrors({ join: 'Enter a valid 6-character code' });
    }
  };

  const copyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (playerId === 'player1') {
      if (form.min >= form.max) {
        newErrors.range = 'Min must be less than max';
      }
    }

    const s = parseInt(form.secret);
    if (isNaN(s) || s < form.min || s > form.max) {
      newErrors.secret = `Must be between ${form.min} and ${form.max}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (playerId === 'player1') {
        setSetup(form.name, gameState.player2.name, form.min, form.max, parseInt(form.secret), gameState.player2.secretNumber);
      } else {
        setSetup(gameState.player1.name, form.name, gameState.range.min, gameState.range.max, gameState.player1.secretNumber, parseInt(form.secret));
      }
      // Note: No router.push here, waiting for both and startGame
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const isCurrentPlayerReady = playerId === 'player1' ? isPlayer1Ready : isPlayer2Ready;
  const isBothReady = isPlayer1Ready && isPlayer2Ready;

  // Lobby View (Host waiting for Guest)
  if (status === 'lobby' && !isOpponentPresent) {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-md w-full space-y-10">
          <header className="space-y-4">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Users className="w-10 h-10 text-blue-500" />
            </div>
            <h1 className="text-4xl font-black text-white">Create Duel</h1>
            <p className="text-slate-400">Your duel room has been created. Invite your opponent to begin.</p>
          </header>

          <div className="bg-slate-900 border-2 border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duel Code</span>
              <div className="flex items-center justify-center gap-4">
                <span className="text-5xl font-black text-white tracking-[0.2em] ml-4">{roomCode}</span>
                <button type="button" onClick={copyCode} className="p-3 bg-slate-800 rounded-2xl hover:text-blue-400 transition-all hover:scale-110 active:scale-95 text-slate-400">
                  {copied ? <Check size={24} className="text-green-500" /> : <Copy size={24} />}
                </button>
              </div>
            </div>
            
            <div className="pt-4 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-blue-400 text-sm font-bold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                Waiting for opponent to join...
              </div>
            </div>
          </div>

          <Button variant="ghost" onClick={() => router.push('/')}>
            Cancel and Return
          </Button>
        </motion.div>
      </main>
    );
  }

  if (mode === 'selection') {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-md w-full space-y-8">
          <header>
            <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h1 className="text-4xl font-black text-white mb-2">Multiplayer</h1>
            <p className="text-slate-400">Choose how you want to start the duel.</p>
          </header>
          
          <div className="space-y-4">
            <Button size="lg" fullWidth onClick={handleCreateRoom} className="h-20 text-xl font-bold">
              Host a Duel
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-800" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-950 px-2 text-slate-500 font-bold">or</span></div>
            </div>
            <div className="space-y-2">
              <Input
                label="Enter Duel Code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ABCDEF"
                className="text-center tracking-widest uppercase font-black"
                maxLength={6}
                error={errors.join}
                id="joinCode"
              />
              <Button variant="secondary" size="lg" fullWidth onClick={handleJoinRoom}>
                Join Duel
              </Button>
            </div>
          </div>
          
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ChevronLeft size={18} className="mr-1" /> Back Home
          </Button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 pb-12">
      <div className="max-w-2xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setMode('selection')}>
            <ChevronLeft size={20} className="mr-1" /> Back
          </Button>
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">Duel Setup</h1>
            <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
              {playerId === 'player1' ? 'Host' : 'Guest'}
            </span>
          </div>
          <div className="w-10" />
        </header>

        <motion.form variants={containerVariants} initial="hidden" animate="visible" onSubmit={handleSubmit} className="space-y-8">
          {/* Room Info (Host Only) */}
          {playerId === 'player1' && (
            <div className="bg-blue-600/10 border-2 border-dashed border-blue-500/30 p-6 rounded-3xl flex flex-col items-center gap-4">
              <p className="text-slate-300 font-medium">Share this code with your opponent:</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-white tracking-widest">{roomCode}</span>
                <button type="button" onClick={copyCode} className="p-2 bg-slate-900 rounded-xl hover:text-blue-400 transition-colors">
                  {copied ? <Check size={24} className="text-green-500" /> : <Copy size={24} />}
                </button>
              </div>
            </div>
          )}

          {/* Player Identity */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2 font-bold uppercase tracking-wider text-sm">
              <Users size={18} /> Your Identity
            </div>
            <Input
              label="Game Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              id="playerName"
            />
          </section>

          {/* Range (Host Only) */}
          {playerId === 'player1' && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-purple-400 mb-2 font-bold uppercase tracking-wider text-sm">
                <Hash size={18} /> Duel Range
              </div>
              <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <Input label="Min" type="number" value={form.min} onChange={(e) => setForm({ ...form, min: parseInt(e.target.value) || 0 })} id="min" />
                <Input label="Max" type="number" value={form.max} onChange={(e) => setForm({ ...form, max: parseInt(e.target.value) || 0 })} id="max" />
              </div>
              {errors.range && <p className="text-sm text-red-500">{errors.range}</p>}
            </section>
          )}

          {/* Secret Number */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-green-400 mb-2 font-bold uppercase tracking-wider text-sm">
              <ShieldCheck size={18} /> Your Secret Number
            </div>
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
              <Input
                label="Secret Number"
                type="password"
                showPasswordToggle
                value={form.secret}
                onChange={(e) => setForm({ ...form, secret: e.target.value })}
                error={errors.secret}
                placeholder={playerId === 'player1' ? "e.g. 42" : "e.g. 73"}
                id="secret"
                disabled={isCurrentPlayerReady}
              />
              <div className="mt-4 flex items-start gap-2 text-slate-500 text-xs">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <p>This is the number your opponent will try to guess. Keep it secret!</p>
              </div>

              {isCurrentPlayerReady && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center border-2 border-green-500/30 rounded-3xl"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-green-500 text-white p-2 rounded-full">
                      <Check size={24} />
                    </div>
                    <span className="text-green-500 font-black uppercase tracking-widest text-sm">You are Ready!</span>
                  </div>
                </motion.div>
              )}
            </div>
          </section>

          <div className="space-y-4 pt-4">
            {!isCurrentPlayerReady ? (
              <Button type="submit" size="lg" fullWidth className="h-16 text-lg">
                Confirm Details & Ready
                <ArrowRight className="ml-2" size={20} />
              </Button>
            ) : isBothReady ? (
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
                  <p className="text-slate-500 text-xs">Both players are locked in. The host can now begin the game.</p>
                </div>
              )
            ) : (
              <div className="bg-slate-900/50 border-2 border-slate-800 p-6 rounded-3xl text-center space-y-3">
                <div className="flex items-center justify-center gap-3 text-slate-400 font-bold animate-pulse">
                  <Loader2 className="animate-spin" size={20} />
                  Waiting for opponent to be ready...
                </div>
                <div className="flex justify-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isPlayer1Ready ? 'bg-green-500' : 'bg-slate-700 animate-pulse'}`} />
                  <div className={`w-3 h-3 rounded-full ${isPlayer2Ready ? 'bg-green-500' : 'bg-slate-700 animate-pulse'}`} />
                </div>
              </div>
            )}
          </div>
        </motion.form>
      </div>
    </main>
  );
}
