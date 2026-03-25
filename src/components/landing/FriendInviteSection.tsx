'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Users, Zap, ArrowRight, Link as LinkIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

import { getBrandName, getActionName } from '@/lib/branding';

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
              className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white leading-tight"
            >
              Invite a Friend. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Claim Victory.</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-sm md:text-base leading-relaxed"
            >
              Strategy is better with a rival. Send the code, start the {getActionName().toLowerCase()}, and prove who owns the signal chain. No install required for your friends.
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
            {/* Cleaned Clash Graphic Visual */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-[3rem] blur-3xl opacity-30" />
            
            <div className="relative h-full w-full bg-slate-900/50 border border-white/10 rounded-[3rem] p-0 backdrop-blur-xl shadow-2xl overflow-hidden flex items-center justify-center">
              {/* Full Background Graphic */}
              <motion.div 
                initial={{ scale: 1.05, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-0 z-0"
              >
                <img 
                  src="/clash_graphic.png" 
                  alt="1 v 1 Clash" 
                  className="w-full h-full object-cover"
                />
                {/* Subtle Overlays for Depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FriendInviteSection;
