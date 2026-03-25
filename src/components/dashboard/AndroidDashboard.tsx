'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Users, Trophy, Coins, ChevronRight, Play, LayoutGrid } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { Variants } from 'framer-motion';

const AndroidDashboard = () => {
  const router = useRouter();
  const { profileData, user } = useAuth();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25 } }
  };

  return (
    <div className="min-h-screen pb-32 pt-20 px-4 space-y-8 max-w-md mx-auto relative">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/5 rounded-full blur-[150px]" />
      </div>

      {/* Profile Header */}
      <motion.header 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-5 shadow-xl"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] shadow-lg shadow-blue-900/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
               {profileData?.photoURL ? (
                 <img src={profileData.photoURL} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-xl font-black text-white">{profileData?.name?.[0]?.toUpperCase() || 'P'}</span>
               )}
            </div>
          </div>
          <div>
            <h1 className="text-lg font-black text-white leading-tight">MatchMind</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{profileData?.name || 'Player'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-950/50 px-4 py-2 rounded-2xl border border-white/5">
          <Coins size={16} className="text-yellow-400" />
          <span className="text-sm font-black text-white">{profileData?.coins || 0}</span>
        </div>
      </motion.header>

      {/* Main Action Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4"
      >
        <motion.div 
          variants={cardVariants}
          onClick={() => router.push('/game')}
          className="group relative h-48 bg-gradient-to-br from-blue-600 to-blue-400 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl shadow-blue-950/40 active:scale-[0.98] transition-all"
        >
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <Brain size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter">VS Computer</h2>
              <p className="text-blue-100/70 text-xs font-bold uppercase tracking-widest">Test your logic</p>
            </div>
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none"
          >
            <Brain size={250} />
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            variants={cardVariants}
            onClick={() => router.push('/setup')}
            className="group relative aspect-square bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 active:scale-[0.96] transition-all overflow-hidden"
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <LayoutGrid size={22} className="text-blue-400" />
              </div>
              <h3 className="text-sm font-black text-white uppercase leading-tight">Create <br/>Room</h3>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none rotate-12">
              <Zap size={100} />
            </div>
          </motion.div>

          <motion.div 
            variants={cardVariants}
            onClick={() => router.push('/onboarding')}
            className="group relative aspect-square bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 active:scale-[0.96] transition-all overflow-hidden"
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Users size={22} className="text-purple-400" />
              </div>
              <h3 className="text-sm font-black text-white uppercase leading-tight">Find <br/>Match</h3>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none rotate-12">
              <Users size={100} />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Weekly Stats or Live Activity */}
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Weekly Global Rank</h4>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex flex-col">
              <span className="text-2xl font-black text-white tracking-tighter">#24</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Global Position</span>
           </div>
           <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              />
           </div>
           <Trophy size={20} className="text-yellow-500" />
        </div>
      </motion.div>
    </div>
  );
};

export default AndroidDashboard;
