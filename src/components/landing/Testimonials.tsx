'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Quote } from 'lucide-react';

const PREDEFINED_TESTIMONIALS = [
  "The duel matching is incredibly fast! Love testing my strategy.",
  "Started playing yesterday and I'm already hooked. The UI is so smooth.",
  "Decent game for a quick break. The strategy keeps it interesting.",
  "Solid experience overall. Fun to see where I rank on the leaderboard.",
  "I like the variety. Some duels are tricky, but that's the point.",
  "Good way to pass time. Pretty straightforward and fun mechanics.",
  "The strategy involved is deeper than it looks at first glance.",
  "Always a challenge. GuessBot is actually quite tough to beat!",
  "Finally a game that respects my time. Short, intense duels.",
  "Love the social aspect with reactions. Makes every win sweeter."
];

interface Player {
  name: string;
}

interface TestimonialData {
  name: string;
  text: string;
  initial: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!db) return;
      try {
        const q = query(collection(db, 'users'), orderBy('coins', 'desc'), limit(30));
        const snapshot = await getDocs(q);
        const players = snapshot.docs
          .map(doc => ({
            name: doc.data().name || 'Anonymous Duelist',
          }))
          .filter(p => {
            const lowName = p.name.toLowerCase();
            return !lowName.includes('duel tester') && 
                   !lowName.includes('duelisttester') && 
                   !lowName.includes('tester');
          });

        const combined = players.slice(0, 20).map((p, i) => ({
          name: p.name,
          text: PREDEFINED_TESTIMONIALS[i % PREDEFINED_TESTIMONIALS.length],
          initial: p.name.charAt(0).toUpperCase()
        }));
        
        setTestimonials(combined);
      } catch (e) {
        console.error("Error fetching testimonials data:", e);
      }
    }
    fetchData();
  }, []);

  if (testimonials.length === 0) return null;

  // Split testimonials for two rows
  const row1 = testimonials.slice(0, Math.ceil(testimonials.length / 2));
  const row2 = testimonials.slice(Math.ceil(testimonials.length / 2));

  return (
    <section className="relative z-10 py-24 overflow-hidden bg-slate-950/20">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase mb-4">Duelist Chronicles</h2>
        <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Real voices from the arena spectrum.</p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Row 1: Moving Left */}
        <MarqueeRow items={row1} direction="left" />
        
        {/* Row 2: Moving Right */}
        <MarqueeRow items={row2} direction="right" />
      </div>

      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
    </section>
  );
}

function MarqueeRow({ items, direction }: { items: TestimonialData[], direction: 'left' | 'right' }) {
  // Duplicate items for seamless loop
  const displayItems = [...items, ...items, ...items];

  return (
    <div className="flex overflow-hidden">
      <motion.div 
        className="flex gap-6 whitespace-nowrap"
        animate={{ 
          x: direction === 'left' ? [0, -1000] : [-1000, 0] 
        }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        {displayItems.map((item, idx) => (
          <div 
            key={idx}
            className="w-[300px] md:w-[350px] bg-card/50 backdrop-blur-xl border border-card-border p-6 rounded-3xl flex flex-col gap-4 shadow-xl hover:border-blue-500/30 transition-colors shrink-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-black shadow-lg shadow-blue-900/20">
                {item.initial}
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black uppercase text-white tracking-tight">{item.name}</h4>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Ranked Duelist</p>
              </div>
              <Quote size={16} className="text-blue-500/20" />
            </div>
            <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed whitespace-normal italic">
              &ldquo;{item.text}&rdquo;
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
