'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Trophy, History, Settings, Brain, User, MessageSquare } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Play', icon: Brain, path: '/setup' },
    { name: 'Ranks', icon: Trophy, path: '/leaderboard' },
    { name: 'History', icon: History, path: '/history' },
    { name: 'Talk', icon: MessageSquare, path: '/contact' },
    { name: 'Me', icon: User, path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-2 pointer-events-none">
      <motion.nav 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto max-w-md h-16 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex items-center justify-around px-2 pointer-events-auto relative overflow-hidden"
      >
        {/* Animated Background Highlight */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none" />
        
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className="relative flex flex-col items-center justify-center w-16 h-full group"
            >
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 bg-blue-500/10 rounded-2xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <item.icon 
                size={22} 
                className={cn(
                  "transition-all duration-300 relative z-10",
                  isActive ? "text-blue-400 scale-110" : "text-slate-500 group-hover:text-slate-300"
                )} 
              />
              
              <span className={cn(
                "text-[10px] font-bold mt-1 transition-all duration-300 relative z-10",
                isActive ? "text-blue-400 opacity-100" : "text-slate-500 opacity-60"
              )}>
                {item.name}
              </span>

              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full blur-[4px] opacity-50" />
              )}
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
};

export default BottomNav;
