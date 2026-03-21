'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, History, ChevronDown, UserCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AvatarDropdown() {
  const { profileData, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    { label: 'Account Settings', icon: <Settings size={14} />, href: '/settings' },
    { label: 'Duel History', icon: <History size={14} />, href: '/history' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-3 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all backdrop-blur-sm group"
      >
        <div className="w-8 h-8 rounded-xl bg-blue-600 overflow-hidden border border-blue-500/50 flex items-center justify-center shadow-lg shadow-blue-900/20">
          {profileData?.photoURL ? (
            <img src={profileData.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={18} className="text-white" />
          )}
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
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-inner shadow-black/20">
                   {profileData?.photoURL ? (
                    <img src={profileData.photoURL} alt="Dropdown" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    profileData?.name?.charAt(0).toUpperCase() || <User size={20} />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white leading-tight uppercase italic">{profileData?.name || 'Player'}</h4>
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
