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
    { name: 'Me', icon: User, path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/5 bg-slate-950/80 backdrop-blur-2xl">
      <motion.nav 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md mx-auto h-20 flex items-center justify-around px-2 relative overflow-hidden"
      >
        {/* Subtle Highlight line at top */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className="relative flex flex-col items-center justify-center min-w-[70px] h-full group pb-2"
            >
              <div className={cn(
                "w-12 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 mb-1",
                isActive ? "bg-blue-500/10" : "group-hover:bg-white/5"
              )}>
                <item.icon 
                  size={20} 
                  className={cn(
                    "transition-all duration-300",
                    isActive ? "text-blue-400" : "text-slate-500"
                  )} 
                />
              </div>
              
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                isActive ? "text-blue-400" : "text-slate-500"
              )}>
                {item.name}
              </span>

              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-indicator"
                  className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full"
                />
              )}
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
};

export default BottomNav;
