'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Users, Zap, ArrowRight, Link as LinkIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

const FriendInviteSection = () => {
  const router = useRouter();

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-full pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Content */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Users size={12} className="fill-current" />
              Better with Friends
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] text-white"
            >
              Match Anyone, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Anywhere.</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              MindMatch is built for instant action. No app downloads required for your friends — just send a magic link and start the match in seconds.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button 
                size="lg" 
                onClick={() => router.push('/setup')}
                className="h-14 px-10 text-base font-black group bg-blue-600 hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.3)]"
              >
                Create a Room
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            {/* Feature Pills */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4"
            >
              <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                <Zap size={14} className="text-blue-400" />
                Instant Start
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                <Share2 size={14} className="text-purple-400" />
                Zero Friction
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                <LinkIcon size={14} className="text-blue-400" />
                Browser Ready
              </div>
            </motion.div>
          </div>

          {/* Visual Side */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            className="flex-1 relative w-full max-w-lg aspect-square"
          >
            {/* Glass Card Interface Mockup */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-[3rem] blur-3xl opacity-30" />
            
            <div className="relative h-full w-full bg-slate-900/50 border border-white/10 rounded-[3rem] p-8 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center">
              {/* Real-time Status Indicator */}
              <div className="absolute top-8 left-8 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Live: 1,240 Online</span>
              </div>

              {/* Animated Share UI */}
              <motion.div 
                 animate={{ y: [0, -10, 0] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="w-full max-w-xs space-y-4"
              >
                <div className="p-6 bg-slate-800/80 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden">
                  <motion.div 
                    animate={{ x: ['100%', '-100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"
                  />
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg shadow-blue-900/40">
                    <LinkIcon size={24} className="text-white" />
                  </div>
                  <div className="h-2 w-3/4 bg-slate-700 rounded-full mx-auto mb-2" />
                  <div className="h-2 w-1/2 bg-slate-700/50 rounded-full mx-auto" />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 p-4 bg-slate-800/80 rounded-2xl border border-white/5 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    Copy Link
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex-1 p-4 bg-blue-600 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-blue-900/40"
                  >
                    Match Found!
                  </motion.div>
                </div>
              </motion.div>

              {/* Floating Avatars with Status Signals */}
              <motion.div 
                animate={{ x: [0, 10, 0], y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-12 right-12 w-12 h-12 bg-purple-600 rounded-2xl border-2 border-slate-900 flex items-center justify-center font-black text-white shadow-xl"
              >
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                J
              </motion.div>
              <motion.div 
                animate={{ x: [0, -15, 0], y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 left-12 w-10 h-10 bg-blue-500 rounded-xl border-2 border-slate-900 flex items-center justify-center font-black text-white shadow-xl"
              >
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900" />
                A
              </motion.div>

              {/* Connecting Signal Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <motion.path
                  d="M100,100 Q200,150 300,300"
                  stroke="url(#grad1)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  fill="none"
                  animate={{ strokeDashoffset: [0, -100] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FriendInviteSection;
