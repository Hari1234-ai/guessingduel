'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, HelpCircle, Swords } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6 bg-slate-950 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-12 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-12 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 flex flex-col items-center text-center max-w-md w-full"
      >
        <motion.div 
          variants={itemVariants}
          className="mb-8 p-4 bg-slate-900/50 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm"
        >
          <Swords className="w-16 h-16 text-blue-500 mb-2" />
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-6xl font-black tracking-tight text-white mb-4 bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400"
        >
          Duel Guess
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-slate-400 text-lg mb-12 leading-relaxed"
        >
          A high-stakes guessing game for two. <br />
          Outsmart your opponent to win the duel.
        </motion.p>
        
        <motion.div 
          variants={itemVariants}
          className="flex flex-col gap-4 w-full"
        >
          <Button 
            size="lg" 
            fullWidth 
            onClick={() => router.push('/setup')}
            className="group"
          >
            <Play className="mr-2 group-hover:fill-current transition-all" size={20} />
            Start New Game
          </Button>
          
          <Button 
            variant="secondary" 
            size="lg" 
            fullWidth 
            onClick={() => setIsHowToPlayOpen(true)}
          >
            <HelpCircle className="mr-2" size={20} />
            How to Play
          </Button>
        </motion.div>
      </motion.div>

      <Modal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        title="How to Play"
      >
        <div className="space-y-6 text-slate-300">
          <section>
            <h3 className="text-white font-bold mb-2 flex items-center">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-2 text-xs">1</span>
              The Setup
            </h3>
            <p>Each player secretly chooses a secret number within the agreed range.</p>
          </section>
          
          <section>
            <h3 className="text-white font-bold mb-2 flex items-center">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-2 text-xs">2</span>
              The Duel
            </h3>
            <p>Take turns guessing your opponent&apos;s number. You&apos;ll get feedback if your guess was too high or too low.</p>
          </section>
          
          <section>
            <h3 className="text-white font-bold mb-2 flex items-center">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-2 text-xs">3</span>
              Victory
            </h3>
            <p>The first player to correctly guess the opponent&apos;s secret number wins the duel!</p>
          </section>

          <Button fullWidth onClick={() => setIsHowToPlayOpen(false)} className="mt-4">
            Got it!
          </Button>
        </div>
      </Modal>

      {/* Top Navigation / Auth */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={logout} 
          className="bg-slate-900/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 px-4 py-2 rounded-xl border border-slate-800 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <footer className="absolute bottom-8 flex flex-col items-center gap-4">
        <span className="text-slate-600 text-sm font-medium">Built with Next.js & Framer Motion</span>
      </footer>
    </main>
  );
}
