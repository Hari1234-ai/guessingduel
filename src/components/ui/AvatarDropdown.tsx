'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, History, ChevronDown, UserCircle, Trophy, Zap, RefreshCcw, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, deleteDoc, orderBy } from 'firebase/firestore';

export default function AvatarDropdown() {
  const { user, profileData, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const resetMyCoins = async () => {
    if (!user || !db) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        coins: 0,
        weeklyCoins: 0,
        updatedAt: serverTimestamp()
      });
      window.location.reload(); 
    } catch (error) {
      console.error('Reset error:', error);
    }
  };

  const cleanupDuplicateMatches = async () => {
    if (!user || !db) return;
    try {
      const q = query(
        collection(db, 'matches'), 
        where('participants', 'array-contains', user.uid)
      );
      const querySnapshot = await getDocs(q);
      
      // Map and sort in memory to avoid needing a composite index in Firestore
      const matches = querySnapshot.docs
        .map(d => ({ id: d.id, ...(d.data() as any) }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      
      const seenRooms = new Set();
      const docsToDelete: string[] = [];
      
      matches.forEach((m) => {
        // Build a unique key for the match based on participants and room code
        const p1 = m.players?.[0]?.uid || '';
        const p2 = m.players?.[1]?.uid || '';
        // Sort UIDs to ensure the key is stable regardless of player order
        const uids = [p1, p2].sort().join('_');
        const roomKey = `${m.roomCode}_${uids}`;

        if (seenRooms.has(roomKey)) {
          docsToDelete.push(m.id);
        } else {
          seenRooms.add(roomKey);
        }
      });
      
      if (docsToDelete.length === 0) {
        alert("No duplicates found. Your history is already clean!");
        return;
      }

      const confirmed = window.confirm(`Found ${docsToDelete.length} duplicates. Wipe them?`);
      if (!confirmed) return;
      
      for (const docId of docsToDelete) {
        await deleteDoc(doc(db, 'matches', docId));
      }
      
      alert(`Cleaned up ${docsToDelete.length} duplicate records!`);
      window.location.reload();
    } catch (error) {
      console.error('Cleanup error:', error);
      alert('Error during cleanup. Check console for details.');
    }
  };

  const resetMyHistory = async () => {
    if (!user || !db) return;
    const confirmed = window.confirm('WIPE ALL HISTORY? This cannot be undone.');
    if (!confirmed) return;
    
    try {
      const q = query(
        collection(db, 'matches'), 
        where('participants', 'array-contains', user.uid)
      );
      const querySnapshot = await getDocs(q);
      
      for (const docSnap of querySnapshot.docs) {
        await deleteDoc(doc(db, 'matches', docSnap.id));
      }
      
      alert('History wiped!');
      window.location.reload();
    } catch (error) {
      console.error('Reset History error:', error);
      alert('Error during history wipe.');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { label: 'Leaderboard', icon: <Trophy size={14} />, href: '/leaderboard' },
    { label: 'Account Settings', icon: <Settings size={14} />, href: '/settings' },
    { label: 'Duel History', icon: <History size={14} />, href: '/history' },
  ];

  const firstLetter = profileData?.name?.charAt(0).toUpperCase() || 'P';

  return (
    <div className="relative flex items-center gap-2" ref={dropdownRef}>
      {/* Coin Balance Pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm shadow-lg shadow-blue-900/5">
        <div className="w-5 h-5 rounded-lg bg-blue-600/20 flex items-center justify-center">
          <Zap size={10} className="text-blue-400 fill-blue-400/20" />
        </div>
        <span className="text-sm font-black text-white tracking-tighter">
          {profileData?.coins || 0}
        </span>
        <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest hidden sm:inline">Coins</span>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-3 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all backdrop-blur-sm group"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center border border-blue-500/50 shadow-lg shadow-blue-900/20 text-white font-black text-sm">
          {firstLetter}
        </div>
        <div className="flex flex-col items-start mr-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em] leading-none mb-1">Duelist</span>
          <span className="text-xs font-black text-white truncate max-w-[80px]">{profileData?.name || 'Player'}</span>
        </div>
        <ChevronDown size={14} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 w-56 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden z-[100]"
          >
            <div className="p-4 border-b border-slate-800 bg-slate-800/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-black shadow-inner shadow-black/20 text-lg">
                   {firstLetter}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white leading-tight uppercase">{profileData?.name || 'Player'}</h4>
                  <p className="text-[10px] text-slate-500 font-bold tracking-widest">{profileData?.email || 'No Email'}</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              {menuItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all font-bold text-xs group"
                >
                  <span className="text-slate-500 group-hover:text-blue-400 transition-colors">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
              
              {/*
              <button 
                onClick={resetMyCoins}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all font-bold text-xs group"
              >
                <RefreshCcw size={14} className="text-blue-400/50 group-hover:text-blue-400 transition-colors" />
                Reset Coins (Debug)
              </button>

              <button 
                onClick={cleanupDuplicateMatches}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-all font-bold text-xs group"
              >
                <Trash2 size={14} className="text-orange-400/50 group-hover:text-orange-400 transition-colors" />
                Cleanup Duplicates
              </button>

              <button 
                onClick={resetMyHistory}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-bold text-xs group"
              >
                <History size={14} className="text-red-400/50 group-hover:text-red-400 transition-colors" />
                Wipe All History (Debug)
              </button>
              */}

              <div className="h-px bg-slate-800 my-2 mx-2" />
              
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-bold text-xs group"
              >
                <LogOut size={14} className="text-red-400/50 group-hover:text-red-400 transition-colors" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
