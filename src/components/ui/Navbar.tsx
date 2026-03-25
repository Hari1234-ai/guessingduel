'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Brain, Zap, Trophy, MessageSquare, CreditCard, Menu, X, LogOut, RefreshCcw, Trash2, History, Settings, Sun, Moon, Coins, LogIn } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AvatarDropdown from './AvatarDropdown';
import Button from './Button';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [guestPlayCount, setGuestPlayCount] = useState<number>(0);
  const [hidden, setHidden] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, profileData, logout, loading } = useAuth();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  useEffect(() => { 
    setIsNative(Capacitor.isNativePlatform()); 
    setMounted(true);
  }, []);

  useEffect(() => {
    const count = localStorage.getItem('guestPlayCount');
    if (count) setGuestPlayCount(parseInt(count));
  }, []);

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
      const matches = querySnapshot.docs
        .map(d => ({ id: d.id, ...(d.data() as any) }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      
      const seenRooms = new Set();
      const docsToDelete: string[] = [];
      matches.forEach((m) => {
        const p1 = m.players?.[0]?.uid || '';
        const p2 = m.players?.[1]?.uid || '';
        const uids = [p1, p2].sort().join('_');
        const roomKey = `${m.roomCode}_${uids}`;
        if (seenRooms.has(roomKey)) docsToDelete.push(m.id);
        else seenRooms.add(roomKey);
      });
      
      if (docsToDelete.length === 0) {
        alert("No duplicates found.");
        return;
      }

      if (window.confirm(`Found ${docsToDelete.length} duplicates. Wipe?`)) {
        for (const docId of docsToDelete) await deleteDoc(doc(db, 'matches', docId));
        alert('Cleaned!');
        window.location.reload();
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  const resetMyHistory = async () => {
    if (!user || !db) return;
    if (!window.confirm('WIPE ALL HISTORY?')) return;
    try {
      const q = query(collection(db, 'matches'), where('participants', 'array-contains', user.uid));
      const querySnapshot = await getDocs(q);
      for (const docSnap of querySnapshot.docs) await deleteDoc(doc(db, 'matches', docSnap.id));
      alert('History wiped!');
      window.location.reload();
    } catch (error) {
      console.error('Reset History error:', error);
    }
  };

  const isPlayLimitReached = !user && guestPlayCount >= 1;

  const navLinks = [
    { 
      label: 'Play MindMatch', 
      href: '/setup', 
      icon: <Brain size={18} /> 
    },
    // { label: 'Plans', href: '/buy', icon: <CreditCard size={18} /> },
    { label: 'Leaderboard', href: '/leaderboard', icon: <Trophy size={18} /> },
    { label: 'History', href: '/history', icon: <History size={18} /> },
    { label: 'Contact', href: '/contact', icon: <MessageSquare size={18} /> },
  ];

  const firstLetter = profileData?.name?.charAt(0).toUpperCase() || 'P';

  if (isNative) return null;

  return (
    <>
      <motion.header
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5"
      >
        <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 group-hover:scale-110 transition-transform">
            <Brain size={20} className="text-white" />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter">
            MindMatch
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 lg:gap-12">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href}
              className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all underline-offset-8 hover:underline hover:text-blue-400 ${
                pathname === link.href ? 'text-blue-400 underline' : 'text-slate-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 min-w-[40px] justify-end">
          {(!mounted || loading) ? (
            <div className="w-10 h-10 rounded-xl bg-slate-800/50 animate-pulse" />
          ) : user ? (
            <>
              {/* Desktop Avatar */}
              <div className="hidden md:block">
                <AvatarDropdown />
              </div>
              
              {/* Mobile Avatar Button (Opens Drawer) */}
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="md:hidden w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center border border-blue-500/50 shadow-lg shadow-blue-900/20 text-white font-black text-lg"
              >
                {firstLetter}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {!(pathname === '/setup' || pathname === '/game' || pathname === '/history' || pathname === '/leaderboard' || pathname === '/buy' || pathname === '/contact' || pathname === '/login') && !(isNative && !user) && (
                <Button 
                  size="md" 
                  onClick={() => router.push(!user && guestPlayCount >= 1 ? '/login' : '/setup')}
                  className="h-10 px-6 font-bold hidden md:inline-flex"
                >
                  {!user && guestPlayCount >= 1 ? 'Login' : 'Play Now'}
                </Button>
              )}
              {/* Mobile Menu Toggle for Guests */}
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
                aria-label="Open Menu"
              >
                <Menu size={24} />
              </button>
            </div>
          )}
        </div>
        </nav>
      </motion.header>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100]"
            />

            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl z-[101] flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-900/20">
                      {firstLetter}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase">{profileData?.name || 'MindMatchist'}</h4>
                      <div className="flex items-center gap-1.5 text-blue-400">
                        <Coins size={12} className="text-blue-400" />
                        <span className="text-xs font-black">{profileData?.coins || 0} Coins</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-900/20">
                      <Brain size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase">Guest</h4>
                      <p className="text-[10px] text-slate-500 font-bold tracking-widest leading-none mt-1">Ready to MindMatch?</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="p-4 flex-grow overflow-y-auto">
                <div className="space-y-2 mb-8">
                  <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Navigation</p>
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold group ${
                        pathname === link.href 
                          ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                          : 'text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                        <span className={pathname === link.href ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}>
                          {link.icon}
                        </span>
                        {link.label}
                      </Link>
                  ))}
                </div>

                {/* Account Actions */}
                {user && (
                  <div className="space-y-2">
                    <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Account Utility</p>
                    <Link href="/settings" onClick={() => setIsDrawerOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:bg-slate-800 transition-all font-bold text-sm">
                      <Settings size={18} className="text-slate-600" /> Account Settings
                    </Link>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="p-6 border-t border-slate-800">
                {user ? (
                  <button 
                    onClick={() => { logout(); setIsDrawerOpen(false); }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 text-red-500 font-black uppercase tracking-tighter hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-900/10"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                ) : (
                  <Button 
                    fullWidth 
                    onClick={() => { router.push('/login'); setIsDrawerOpen(false); }}
                    className="h-14 rounded-2xl font-black uppercase tracking-tighter"
                  >
                    <LogIn size={18} className="mr-2" />
                    Sign In to Arena
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
