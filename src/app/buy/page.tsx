'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';

export default function PlansPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden relative flex flex-col">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <section className="relative z-10 flex-grow flex flex-col items-center justify-center pt-20 pb-24 px-6 text-center max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <Sparkles size={12} className="fill-current" />
            Arena Upgrades
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
            Strategic <br />
            <span className="text-blue-500 text-shadow-glow">Plans.</span>
          </h1>

          <div className="max-w-xl mx-auto p-12 rounded-[3rem] bg-slate-900/40 border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
            
            <p className="text-slate-400 text-lg md:text-xl font-bold italic leading-relaxed">
              &quot;We are curating the best plans for you coming soon.&quot;
            </p>
            
            <div className="mt-8 flex justify-center gap-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-600/40 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>

          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] pt-8">
            Elevating your dueling experience
          </p>
        </motion.div>
      </section>

      <footer className="relative z-10 p-12 border-t border-white/5 text-center">
        <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em]">Duel Arena • Experimental Systems</p>
      </footer>
    </main>
  );
}
