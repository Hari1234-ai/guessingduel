'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { History, ArrowLeft, Trophy, Search, Filter, Swords, Calendar, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/ui/Navbar';

interface Match {
  id: string;
  opponentName: string;
  result: 'win' | 'loss';
  date: string;
  secretNumber: number;
  opponentSecret: number;
  totalGuesses: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user || !db) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'matches'),
          where('participants', 'array-contains', user.uid),
          orderBy('createdAt', 'desc'),
          limit(20)
        );

        const querySnapshot = await getDocs(q);
        const fetchedMatches: Match[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const players = data.players || [];
          const myData = players.find((p: any) => p.uid === user.uid);
          const opponent = players.find((p: any) => p.uid !== user.uid);
          
          // Determine winner (handles both UID and 'player1'/'player2' labels)
          let isWinner = false;
          if (data.winner === user.uid) {
            isWinner = true;
          } else if (data.winner === 'player1' && players[0]?.uid === user.uid) {
            isWinner = true;
          } else if (data.winner === 'player2' && players[1]?.uid === user.uid) {
            isWinner = true;
          }

          // Handle Firestore Timestamp
          const timestamp = data.createdAt;
          let dateStr = 'Invalid Date';
          if (timestamp && typeof timestamp.toDate === 'function') {
            const d = timestamp.toDate();
            dateStr = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          } else if (timestamp && timestamp.seconds) { // Fallback for plain objects
            const d = new Date(timestamp.seconds * 1000);
            dateStr = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          }

          fetchedMatches.push({
            id: doc.id,
            opponentName: opponent?.name || 'Unknown Rival',
            result: isWinner ? 'win' : 'loss',
            date: dateStr,
            secretNumber: myData?.secretNumber || 0,
            opponentSecret: opponent?.secretNumber || 0,
            totalGuesses: myData?.guesses?.length || 0
          });
        });

        setMatches(fetchedMatches);
      } catch (error) {
        console.error("Error fetching match history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px]" />

      <Navbar />

      <div className="max-w-4xl mx-auto relative z-10 pt-12">
        <header className="flex items-center justify-between mb-12">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:border-slate-700">
              <ArrowLeft size={16} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </button>
        </header>

        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-4">
            <History size={32} className="text-blue-500" />
            Duel History
          </h1>
          <p className="text-slate-500 text-sm mt-2">Your legacy recorded in the halls of fate.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading Records...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-16 text-center shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-600">
               {user ? <Swords size={32} /> : <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20"><Zap className="text-blue-400" size={32} /></div>}
            </div>
            <h3 className="text-xl font-bold mb-2">
              {user ? "No duels recorded yet." : "Duel History Locked."}
            </h3>
            <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">
              {user ? "Start your first duel to begin building your competitive legacy." : "Sign in to view your complete combat record and historical signals."}
            </p>
            <Button onClick={() => router.push(user ? '/setup' : '/login')} size="md" className="px-8 font-black h-12">
              {user ? "Start New Duel" : "Sign in to Arena"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
             {matches.map((match, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={match.id}
                  className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:border-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                      match.result === 'win' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'
                    }`}>
                      {match.result === 'win' ? <Trophy size={28} /> : <Swords size={28} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          match.result === 'win' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {match.result.toUpperCase()}
                        </span>
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                          <Calendar size={10} /> {match.date}
                        </span>
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-tight">vs {match.opponentName}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 w-full md:w-auto justify-around opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Guesses</p>
                      <p className="font-black text-white">{match.totalGuesses}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Your Num</p>
                      <p className="font-black text-blue-400">{match.secretNumber}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Rival Num</p>
                      <p className="font-black text-purple-400">{match.opponentSecret}</p>
                    </div>
                  </div>
                </motion.div>
             ))}
          </div>
        )}
      </div>
    </main>
  );
}
