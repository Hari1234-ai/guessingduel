'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, HelpCircle, Swords, LogOut } from 'lucide-react';
import AvatarDropdown from '@/components/ui/AvatarDropdown';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
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
    <main className="flex flex-1 flex-col items-center justify-center p-6 bg-slate-950 min-h-screen overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-12 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl shadow-[0_0_100px_rgba(37,99,235,0.05)]" />
      <div className="absolute bottom-1/4 -right-12 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl shadow-[0_0_100px_rgba(147,51,234,0.05)]" />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 flex flex-col items-center text-center max-w-[20rem] w-full"
      >
        <motion.div 
          variants={itemVariants}
          className="mb-4 p-3 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-sm"
        >
          <Swords className="w-10 h-10 text-blue-500 mb-1" />
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-3xl font-black tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400"
        >
          Guessing Duel
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-slate-400 text-xs mb-8 leading-relaxed"
        >
          Ready for another round? <br />
          Outsmart your rival to win.
        </motion.p>
        
        <motion.div 
          variants={itemVariants}
          className="flex flex-col gap-3 w-full"
        >
          <Button 
            size="md" 
            fullWidth 
            onClick={() => router.push('/setup')}
            className="group h-11 text-sm font-bold"
          >
            <Play className="mr-2 group-hover:fill-current transition-all" size={16} />
            Start New Game
          </Button>
          
          <Button 
            variant="secondary" 
            size="md" 
            fullWidth 
            onClick={() => setIsHowToPlayOpen(true)}
            className="h-11 text-sm font-bold opacity-80"
          >
            <HelpCircle className="mr-2" size={16} />
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
            <p className="text-sm">Each player secretly chooses a secret number within the agreed range.</p>
          </section>
          
          <section>
            <h3 className="text-white font-bold mb-2 flex items-center">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-2 text-xs">2</span>
              The Duel
            </h3>
            <p className="text-sm">Take turns guessing your opponent&apos;s number. You&apos;ll get feedback if your guess was too high or too low.</p>
          </section>
          
          <section>
            <h3 className="text-white font-bold mb-2 flex items-center">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mr-2 text-xs">3</span>
              Victory
            </h3>
            <p className="text-sm">The first player to correctly guess the opponent&apos;s secret number wins the duel!</p>
          </section>

          <Button fullWidth onClick={() => setIsHowToPlayOpen(false)} className="mt-4">
            Got it!
          </Button>
        </div>
      </Modal>

      {/* Top Header / Avatar */}
      <div className="fixed top-6 right-6 z-50">
        <AvatarDropdown />
      </div>

      <footer className="absolute bottom-6 flex flex-col items-center gap-3">
        <span className="text-slate-600 text-xs font-medium tracking-tight">Built with Next.js & Framer Motion</span>
      </footer>
    </main>
  );
}
