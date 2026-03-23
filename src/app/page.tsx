'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Swords, Play, Shield, Zap, Users, ChevronRight, Bot, Trophy, Coins, Star, Smile } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';
import Navbar from '@/components/ui/Navbar';
import Testimonials from '@/components/landing/Testimonials';
import Feedback from '@/components/landing/Feedback';

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
    <main className="min-h-screen bg-background text-foreground overflow-hidden relative transition-colors duration-300">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent)] opacity-10 pointer-events-none" />
        
        {/* Floating Background Assets */}
        <FloatingElement className="top-[15%] left-[10%] text-blue-500" delay={0}>
          <Swords size={40} />
        </FloatingElement>
        <FloatingElement className="top-[25%] right-[15%] text-purple-500" delay={2} duration={12}>
          <Shield size={32} />
        </FloatingElement>
        <FloatingElement className="bottom-[30%] left-[15%] text-purple-500" delay={4} duration={15}>
          <Zap size={24} />
        </FloatingElement>
        <FloatingElement className="bottom-[20%] right-[12%] text-blue-500" delay={1} duration={14}>
          <Users size={36} />
        </FloatingElement>
        
        <div className="absolute top-[40%] left-[20%] w-1 h-1 bg-white/20 rounded-full animate-ping" />
        <div className="absolute top-[60%] right-[25%] w-1 h-1 bg-white/20 rounded-full animate-ping [animation-delay:1s]" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-12 md:pt-36 md:pb-24 px-6 text-center">
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

          <motion.h1 variants={itemVariants} className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase italic leading-[0.85] text-foreground">
            Outsmart <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">Your Rivals.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Duel is the ultimate real-time testing of strategy and luck. 
            Challenge friends to a high-stakes duel where every guess count.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => setIsHowToPlayOpen(true)}
              className="h-12 px-8 text-sm font-black w-full sm:w-auto"
            >
              View Rules
            </Button>
            <Button 
              size="lg" 
              onClick={() => router.push('/setup')}
              className="h-12 px-8 text-sm font-black group w-full sm:w-auto"
            >
              Play now
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </section>
      
      {/* How It Works Section */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20 text-foreground">
          <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase mb-4">How it works?</h2>
          <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Simple, strategic, and built for your success.</p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-orange-500 via-blue-500 via-purple-500 to-green-500 opacity-30" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-4 relative z-10">
            <StepItem 
              icon={<Users size={28} className="text-blue-400" />} 
              title="Start a Room" 
              desc="Join or create a game with a secret code." 
              border="border-blue-500/30" 
              glow="shadow-blue-500/10"
            />
            <StepItem 
              icon={<Shield size={28} className="text-blue-400" />} 
              title="Set Your Number" 
              desc="Pick a secret number for your opponent to guess." 
              border="border-blue-500/30"
              glow="shadow-blue-500/10"
            />
            <StepItem 
              icon={<Zap size={28} className="text-purple-400" />} 
              title="Guess & Strike" 
              desc="Take turns guessing. We'll tell you if it's too high or low." 
              border="border-purple-500/30"
              glow="shadow-purple-500/10"
            />
            <StepItem 
              icon={<Swords size={28} className="text-purple-400" />} 
              title="Win the Duel" 
              desc="Be the first to guess the exact number and win!" 
              border="border-purple-500/30"
              glow="shadow-purple-500/10"
            />
          </div>
        </div>
      </section>


      {/* VS AI Section */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <Bot size={12} className="fill-current" />
              Practice Mode
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight text-foreground text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Sharpen your <br />skills vs AI.
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md mx-auto md:mx-0">
              Not ready to face real players? Challenge our intelligent AI opponent to practice your strategies, understand the game mechanics, and prepare for high-stakes duels!
            </p>
            <Button 
              size="lg" 
              onClick={() => router.push('/setup')}
              className="h-12 px-8 text-sm font-black group bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
            >
              Play VS AI
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <div className="flex-1 relative w-full max-w-sm mx-auto">
            <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full" />
            <div className="relative bg-card border border-card-border p-8 rounded-3xl backdrop-blur-sm shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
              <Bot size={80} className="text-purple-400 mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
              <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">GuessBot</h3>
              <p className="text-slate-500 text-sm font-bold">Always ready for a duel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reactions Section */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <Smile size={12} className="fill-current" />
              Social Interaction
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-tight text-foreground text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
              Express Yourself. <br />Taunt with Style.
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md mx-auto md:mx-0">
              Communication is key in every duel. Use our real-time emoji reactions to celebrate a great guess, taunt your rival, or show your frustration. Strategy isn&apos;t just about numbers; it&apos;s about psychology.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              {['🔥', '😂', '🤯', '🥶', '🤫', '🤡'].map((emoji, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-12 h-12 rounded-2xl bg-card border border-card-border flex items-center justify-center text-2xl shadow-lg hover:border-orange-500/50 transition-colors"
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
          </div>
          <div className="flex-1 relative w-full max-w-md mx-auto">
            <div className="absolute inset-0 bg-orange-500/20 blur-[120px] rounded-full" />
            <div className="relative bg-card border border-card-border p-10 rounded-[3rem] backdrop-blur-sm shadow-2xl overflow-hidden aspect-square flex items-center justify-center">
              <div className="grid grid-cols-3 gap-6 relative z-10 scale-125">
                 {['🤫', '🔥', '🤡', '🤯', '🥶', '😂'].map((emoji, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        y: [0, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: i * 0.5
                      }}
                      className="text-4xl filter drop-shadow-[0_0_10px_rgba(251,146,60,0.3)]"
                    >
                      {emoji}
                    </motion.div>
                 ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <Smile size={300} className="text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards & Leaderboard Section */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 text-foreground">
          <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase mb-4">Climb the Ranks</h2>
          <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Prove your worth. Earn rewards. Become a legend.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Rewards Card */}
          <div className="bg-card border border-card-border p-10 rounded-[2.5rem] backdrop-blur-sm shadow-2xl flex flex-col items-start relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[80px] rounded-full group-hover:bg-yellow-500/20 transition-all duration-500" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mb-6 shadow-lg shadow-yellow-900/20 relative z-10">
              <Coins size={32} className="text-yellow-950" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-4 relative z-10">Earn Coins</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 relative z-10">
              Every victory in Duel earns you valuable coins. Stack your riches, show off your wealth, and unlock exclusive features as you dominate your opponents.
            </p>
            <div className="space-y-3 w-full relative z-10">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                <Star size={16} className="text-yellow-500" /> Win Duels vs Real Players
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                <Star size={16} className="text-yellow-500" /> Defeat the AI
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                <Star size={16} className="text-yellow-500" /> Claim Weekly Rewards
              </div>
            </div>
          </div>

          {/* Leaderboard Card */}
          <div className="bg-card border border-card-border p-10 rounded-[2.5rem] backdrop-blur-sm shadow-2xl flex flex-col items-start relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-all duration-500" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20 relative z-10">
              <Trophy size={32} className="text-blue-950" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-4 relative z-10">Global Leaderboard</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 relative z-10">
              Compete against the best guessers in the world! Check your rank, see who&apos;s on top, and fight for your spot in the Hall of Fame. Are you the ultimate duelist?
            </p>
            <Button 
              variant="secondary"
              size="lg" 
              onClick={() => router.push('/leaderboard')}
              className="mt-auto h-12 px-8 text-[10px] xs:text-xs sm:text-sm font-black group relative z-10 bg-slate-800 hover:bg-slate-700 w-full sm:w-auto"
            >
              View Leaderboard
              <Trophy size={16} className="ml-2 text-blue-400 group-hover:scale-110 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      <Testimonials />
      <Feedback />

      {/* Modals */}
      <Modal isOpen={isHowToPlayOpen} onClose={() => setIsHowToPlayOpen(false)} title="Game Rules">
        <div className="space-y-6 text-slate-300 p-2">
          <p className="text-sm leading-relaxed">
            Duel is a strategic race. Both players choose a secret number and try to guess their opponent&apos;s number first.
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


function RuleItem({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex gap-4 items-start p-4 rounded-2xl bg-card border border-card-border">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black shrink-0">{number}</div>
      <div>
        <h4 className="font-bold text-foreground mb-1">{title}</h4>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

function StepItem({ icon, title, desc, border, glow }: { icon: React.ReactNode, title: string, desc: string, border: string, glow: string }) {
  return (
    <div className="flex flex-col items-center text-center group">
      <div className={`w-20 h-20 rounded-full bg-card backdrop-blur-xl border ${border} flex items-center justify-center text-foreground mb-6 shadow-2xl ${glow} group-hover:scale-110 group-hover:bg-card/80 transition-all relative z-10`}>
        {icon}
      </div>
      <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-foreground">{title}</h3>
      <p className="text-slate-500 text-xs leading-relaxed max-w-[200px] font-bold">{desc}</p>
    </div>
  );
}

function FloatingElement({ children, className, delay = 0, duration = 10 }: { children: React.ReactNode, className: string, delay?: number, duration?: number }) {
  return (
    <motion.div
      initial={{ y: 0, rotate: 0 }}
      animate={{ 
        y: [0, -20, 0],
        rotate: [0, 10, -10, 0],
      }}
      transition={{ 
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
      className={`absolute pointer-events-none opacity-10 ${className}`}
    >
      {children}
    </motion.div>
  );
}
