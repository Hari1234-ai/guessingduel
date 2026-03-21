'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Swords, Play, Shield, Zap, Users, ChevronRight, Github } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';
import AvatarDropdown from '@/components/ui/AvatarDropdown';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
  } as const;

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Swords size={18} className="text-white" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">Guessing Duel</span>
        </div>

        {/* Middle Links */}
        <div className="hidden md:flex items-center gap-12">
          <Link href="/buy" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-400 transition-all italic underline-offset-8 hover:underline">Buy</Link>
          <Link href="/contact" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-400 transition-all italic underline-offset-8 hover:underline">Contact Us</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <AvatarDropdown />
          ) : (
            <Button 
              size="md" 
              onClick={() => router.push('/login')}
              className="h-10 px-6 font-bold"
            >
              Play Now
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 px-6 flex flex-col items-center text-center max-w-5xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <Zap size={12} className="fill-current" />
            Season 1: The Awakening
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
            Outsmart <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Your Rivals.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Guessing Duel is the ultimate real-time testing of strategy and luck. 
            Challenge friends to a high-stakes duel where every guess count.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => setIsHowToPlayOpen(true)}
              className="h-14 px-10 text-lg font-black w-full sm:w-auto"
            >
              View Rules
            </Button>
            <Button 
              size="lg" 
              onClick={() => router.push(user ? '/setup' : '/login')}
              className="h-14 px-10 text-lg font-black group w-full sm:w-auto"
            >
              Start for free
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-12 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Zap className="text-yellow-400" size={24} />}
            title="Real-time Action"
            description="Powered by Ably for lightning-fast, lag-free multiplayer duels."
          />
          <FeatureCard 
            icon={<Shield className="text-blue-400" size={24} />}
            title="Secure Play"
            description="Firebase-backed authentication keeps your stats and profile safe."
          />
          <FeatureCard 
            icon={<Users className="text-purple-400" size={24} />}
            title="Team Battles"
            description="Host private rooms or join existing duels with a simple invite code."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 pt-24 pb-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Swords size={20} className="text-blue-500" />
              <span className="text-lg font-black tracking-tighter uppercase italic">Guessing Duel</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs">The strategic number guessing game for competitive spirits.</p>
          </div>

          <div className="flex gap-12 text-sm font-bold uppercase tracking-widest">
            <div className="flex flex-col gap-4 items-center md:items-start">
              <span className="text-slate-600 text-[10px] mb-2">Legal</span>
              <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms</Link>
              <Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact Us</Link>
            </div>
            <div className="flex flex-col gap-4 items-center md:items-start">
              <span className="text-slate-600 text-[10px] mb-2">Connect</span>
              <a href="#" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <Github size={14} /> Github
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center text-[10px] text-slate-700 font-black uppercase tracking-[0.3em]">
          Inspired by Modern Cyber Aesthetics • 2024
        </div>
      </footer>

      {/* Modals */}
      <Modal isOpen={isHowToPlayOpen} onClose={() => setIsHowToPlayOpen(false)} title="Game Rules">
        <div className="space-y-6 text-slate-300 p-2">
          <p className="text-sm leading-relaxed">
            Guessing Duel is a strategic race. Both players choose a secret number and try to guess their opponent&apos;s number first.
          </p>
          <div className="grid gap-4">
            <RuleItem number="1" title="Set your Secret" desc="Choose a number within the range (e.g., 1-100)." />
            <RuleItem number="2" title="Take Turns" desc="Guess a number. We'll tell you if it's too high or too low." />
            <RuleItem number="3" title="Win the Duel" desc="The first to guess the exact number wins!" />
          </div>
          <Button fullWidth onClick={() => setIsHowToPlayOpen(false)} className="mt-6">Let&apos;s Play</Button>
        </div>
      </Modal>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-[2rem] bg-slate-900/40 border border-white/5 backdrop-blur-sm hover:border-blue-500/30 transition-all group">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-black mb-3 italic uppercase tracking-tight">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function RuleItem({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex gap-4 items-start p-4 rounded-2xl bg-white/5 border border-white/5">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black shrink-0">{number}</div>
      <div>
        <h4 className="font-bold text-white mb-1">{title}</h4>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  );
}
