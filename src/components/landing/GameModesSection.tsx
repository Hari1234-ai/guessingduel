'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Hash, Sparkles, Brain, Trophy, ChevronRight, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

const GameModesSection = () => {
  const router = useRouter();

  const modes = [
    {
      id: 'numeric-easy',
      title: 'Numeric: Easy',
      range: '1 - 100',
      desc: 'The perfect entry point. Quick, intense, and requires sharp intuition.',
      icon: <Zap size={24} className="text-blue-400" />,
      color: 'blue',
      tag: 'Most Popular'
    },
    {
      id: 'numeric-hard',
      title: 'Numeric: Hard',
      range: 'Custom Range',
      desc: 'Total control. Set your own limits and challenge your friends to the ultimate duel.',
      icon: <Trophy size={24} className="text-purple-400" />,
      color: 'purple',
      tag: 'Strategic'
    },
    {
      id: 'word-duel',
      title: 'Word Duel',
      range: '5 Letters',
      desc: 'A battle of vocabulary. Guess the hidden word using strategy and feedback.',
      icon: <Brain size={24} className="text-emerald-400" />,
      color: 'emerald',
      tag: 'New Mode'
    }
  ];

  return (
    <section className="py-24 px-6 bg-slate-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <Sparkles size={12} className="fill-current" />
            Endless Variety
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-white">Choose Your Challenge</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">Multiple ways to MindMatch. One goal: Win.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {modes.map((mode, i) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative bg-slate-900/50 border border-white/5 rounded-[2rem] p-8 backdrop-blur-sm hover:bg-slate-800/80 hover:border-white/10 transition-all shadow-2xl overflow-hidden"
            >
              {/* Card Glow */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 bg-${mode.color}-500/5 blur-[80px] rounded-full group-hover:bg-${mode.color}-500/10 transition-all`} />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className={`p-4 rounded-2xl bg-${mode.color}-500/10 border border-${mode.color}-500/20 shadow-lg shadow-${mode.color}-900/10`}>
                    {mode.icon}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-${mode.color}-500/10 text-${mode.color}-400 border border-${mode.color}-500/20`}>
                    {mode.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black tracking-tight text-white mb-1 uppercase">{mode.title}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <Hash size={12} className="text-slate-600" />
                    {mode.range}
                  </div>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed min-h-[60px]">
                  {mode.desc}
                </p>

                <Button 
                  variant="secondary"
                  fullWidth
                  onClick={() => router.push('/setup')}
                  className="bg-slate-800 hover:bg-slate-700 text-xs font-black uppercase tracking-widest py-4 border-white/5 group"
                >
                  Play now
                  <ChevronRight size={14} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GameModesSection;
