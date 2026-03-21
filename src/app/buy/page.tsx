'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Shield, Crown, Check, ArrowRight, Swords } from 'lucide-react';
import Button from '@/components/ui/Button';
import AvatarDropdown from '@/components/ui/AvatarDropdown';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function BuyPage() {
  const router = useRouter();
  const { user } = useAuth();

  const plans = [
    {
      name: "Challenger",
      price: "Free",
      description: "Start your dueling journey with all basic features.",
      features: ["All Core Game Modes", "Global Matchmaking", "Basic Duel History", "Community Discord Access"],
      premium: false
    },
    {
      name: "Legendary",
      price: "$2.99",
      period: "/month",
      description: "For the elite duelists who want total customization.",
      features: ["Exclusive Avatar Borders", "Advanced Stats Analysis", "Custom Duel Rooms", "Zero Ads (Future Release)", "Priority Matchmaking"],
      premium: true
    }
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Swords size={18} className="text-white" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">Guessing Duel</span>
        </Link>

        {/* Middle Links */}
        <div className="hidden md:flex items-center gap-12">
          <Link href="/buy" className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 transition-all italic underline-offset-8 underline">Buy</Link>
          <Link href="/contact" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-400 transition-all italic underline-offset-8 hover:underline">Contact Us</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? <AvatarDropdown /> : (
            <Button size="md" onClick={() => router.push('/login')} className="h-10 px-6 font-bold">Play Now</Button>
          )}
        </div>
      </nav>

      <section className="relative z-10 pt-20 pb-24 px-6 text-center max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
            Unlock Your <br />
            <span className="text-blue-500 text-shadow-glow">Full Potential.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Support the game and gain exclusive perks to dominate the arena.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mt-16 max-w-4xl mx-auto px-4">
          {plans.map((plan, idx) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-10 rounded-[2.5rem] border text-left flex flex-col ${
                plan.premium ? 'bg-blue-600/10 border-blue-500/30 ring-2 ring-blue-500/20' : 'bg-slate-900/40 border-slate-800'
              } backdrop-blur-xl relative group`}
            >
              {plan.premium && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Crown size={12} /> Recommended
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-black italic uppercase tracking-tight mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  {plan.period && <span className="text-slate-500 font-bold">{plan.period}</span>}
                </div>
                <p className="text-slate-500 text-sm mt-4 font-medium">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map(feature => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.premium ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      <Check size={12} />
                    </div>
                    <span className="text-sm font-bold text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                variant={plan.premium ? 'primary' : 'secondary'}
                fullWidth 
                size="lg"
                className="h-14 font-black group"
              >
                {plan.premium ? 'Go Legendary' : 'Current Status'}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="mt-24 p-12 border-t border-white/5 text-center">
        <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em]">Become a Part of the Legend</p>
      </footer>
    </main>
  );
}
