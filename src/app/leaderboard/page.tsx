'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, ArrowLeft, Loader2, Zap, Swords } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import Button from '@/components/ui/Button';
import AvatarDropdown from '@/components/ui/AvatarDropdown';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface LeaderboardEntry {
  uid: string;
  name: string;
  weeklyCoins: number;
  coins: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'weekly' | 'all-time'>('weekly');

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!db) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'users'),
          orderBy(view === 'weekly' ? 'weeklyCoins' : 'coins', 'desc'),
          limit(50)
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        } as LeaderboardEntry));
        setEntries(results);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [view]);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Swords size={18} className="text-white" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">Guessing Duel</span>
        </Link>

        {/* Middle Links */}
        <div className="hidden md:flex items-center gap-8 lg:gap-12">
          <Link href="/buy" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-400 transition-all italic underline-offset-8 hover:underline">Buy</Link>
          <Link href="/leaderboard" className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 transition-all italic underline-offset-8 underline">Leaderboard</Link>
          <Link href="/contact" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-400 transition-all italic underline-offset-8 hover:underline">Contact Us</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? <AvatarDropdown /> : (
            <Button size="md" onClick={() => router.push('/login')} className="h-10 px-6 font-bold">Play Now</Button>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Title Section */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest mb-6"
          >
            <Trophy size={14} /> Global Rankings
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-none mb-6">
            Hall of <span className="text-blue-500">Legends.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto italic">
            Weekly rewards reset every Monday. Duel your way to the top of the signal chain.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-10">
          <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 flex gap-2 backdrop-blur-md">
            <button 
              onClick={() => setView('weekly')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                view === 'weekly' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setView('all-time')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                view === 'all-time' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              All-Time
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] backdrop-blur-xl shadow-2xl overflow-hidden">
          {loading ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <Loader2 size={32} className="text-blue-500 animate-spin" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Scanning Frequencies...</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {entries.length > 0 ? entries.map((entry, idx) => (
                <motion.div 
                  key={entry.uid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-center p-6 transition-colors hover:bg-slate-800/20 ${
                    user?.uid === entry.uid ? 'bg-blue-600/5' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="w-12 flex justify-center shrink-0">
                    {idx === 0 ? <Crown className="text-yellow-500" size={24} /> :
                     idx === 1 ? <Medal className="text-slate-300" size={22} /> :
                     idx === 2 ? <Medal className="text-amber-600" size={20} /> :
                     <span className="text-slate-600 font-black italic">{idx + 1}</span>}
                  </div>

                  {/* Duelist */}
                  <div className="flex items-center gap-4 flex-grow px-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center border border-blue-500/50 shadow-lg text-white font-black italic shadow-blue-900/20">
                      {entry.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                        {entry.name}
                        {user?.uid === entry.uid && (
                          <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-[8px] text-blue-400 uppercase italic">You</span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Duelist</p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1.5 text-blue-400 mb-1">
                      <Zap size={14} className="fill-blue-400/20" />
                      <span className="text-xl font-black italic tracking-tighter">
                        {view === 'weekly' ? entry.weeklyCoins : entry.coins}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Signal Units</p>
                  </div>
                </motion.div>
              )) : (
                <div className="py-24 text-center">
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No signals detected this week.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-12 text-center pb-12">
          <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em]">Become a Part of the Legend</p>
        </div>
      </div>
    </main>
  );
}
