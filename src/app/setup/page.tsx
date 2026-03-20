'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Hash, ShieldCheck, ArrowRight, ChevronLeft, Copy, Check, Info } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function Setup() {
  const router = useRouter();
  const { gameState, createRoom, joinRoom, setSetup } = useGame();
  const { roomCode, playerId, status } = gameState;

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
        // Host sets range and their own secret
        // Note: For real multiplayer, we'd wait for guest to join
        setSetup(form.name, gameState.player2.name, form.min, form.max, parseInt(form.secret), gameState.player2.secretNumber);
      } else {
        // Guest sets their own name and secret
        setSetup(gameState.player1.name, form.name, gameState.range.min, gameState.range.max, gameState.player1.secretNumber, parseInt(form.secret));
      }
      router.push('/game');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

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
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <Input
                label="Secret Number"
                type="password"
                showPasswordToggle
                value={form.secret}
                onChange={(e) => setForm({ ...form, secret: e.target.value })}
                error={errors.secret}
                placeholder={playerId === 'player1' ? "e.g. 42" : "e.g. 73"}
                id="secret"
              />
              <div className="mt-4 flex items-start gap-2 text-slate-500 text-xs">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <p>This is the number your opponent will try to guess. Keep it secret!</p>
              </div>
            </div>
          </section>

          <Button type="submit" size="lg" fullWidth className="h-16 text-lg">
            Ready for Duel
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </motion.form>
      </div>
    </main>
  );
}
