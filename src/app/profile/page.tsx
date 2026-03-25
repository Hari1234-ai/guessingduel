'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Trophy, Coins, Settings, LogOut, ChevronLeft, Shield, Star, Calendar, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isNativePlatform } from '@/lib/platform';
import Button from '@/components/ui/Button';
import Navbar from '@/components/ui/Navbar';
import BottomNav from '@/components/ui/BottomNav';
import Modal from '@/components/ui/Modal';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profileData, logout, loading } = useAuth();
  const [isNative, setIsNative] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    setIsNative(isNativePlatform());
  }, []);

  if (loading) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-32">
      {!isNative && <Navbar />}

      <div className="max-w-md mx-auto px-6 pt-12 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
           <h1 className="text-2xl font-black uppercase tracking-tighter">Your Profile</h1>
        </div>

        {/* Profile Card */}
        {/* ... existing card code ... */}
        
        {/* Rest of the component ... */}

        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 space-y-6 text-center shadow-2xl"
        >
          <div className="relative mx-auto w-24 h-24">
            <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-blue-500 to-purple-600 p-[3px]">
              <div className="w-full h-full bg-slate-950 rounded-[calc(2rem-3px)] flex items-center justify-center overflow-hidden">
                {profileData?.photoURL ? (
                  <img src={profileData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-slate-500" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center border-4 border-slate-950 shadow-lg shadow-blue-900/20">
              <Trophy size={18} className="text-white" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black">{profileData?.name || 'Guest Player'}</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1">
              <Mail size={12} /> {profileData?.email || 'No email provided'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Coins</p>
              <div className="flex items-center justify-center gap-2">
                <Coins size={16} className="text-yellow-400" />
                <span className="text-lg font-black">{profileData?.coins || 0}</span>
              </div>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Success Rate</p>
              <div className="flex items-center justify-center gap-2">
                <Star size={16} className="text-blue-400" />
                <span className="text-lg font-black">78%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats List */}
        <div className="space-y-3">
          <ProfileStat icon={<Shield className="text-green-400" />} label="Security" value="Level 2 Secured" />
          <ProfileStat icon={<Calendar className="text-blue-400" />} label="Member Since" value="March 2024" />
        </div>

        {/* Actions */}
        <div className="space-y-4 pt-4">
          <Button 
            onClick={() => router.push('/history')}
            variant="secondary" 
            fullWidth 
            className="h-16 rounded-3xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 border border-white/5 bg-slate-900/50 hover:bg-slate-900"
          >
            <History size={18} className="text-blue-400" /> Combat History
          </Button>

          <Button 
            onClick={() => setIsSettingsOpen(true)}
            variant="secondary" 
            fullWidth 
            className="h-14 rounded-3xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border border-white/5"
          >
            <Settings size={18} /> Account Settings
          </Button>

          <Button 
            onClick={logout}
            fullWidth 
            className="h-14 rounded-3xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
          >
            <LogOut size={18} /> Sign Out
          </Button>
        </div>
      </div>

      <Modal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        title="Account Settings"
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
            <Settings size={32} className="text-slate-500 animate-spin-slow" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight">V1.2 encrypted</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Advanced account management, profile editing and security overrides are currently being synchronized for the next update.
          </p>
          <Button fullWidth onClick={() => setIsSettingsOpen(false)} className="mt-4 font-black">
            Acknowledged
          </Button>
        </div>
      </Modal>

      {isNative && <BottomNav />}
    </main>
  );
}

function ProfileStat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between p-5 bg-slate-900/30 border border-white/5 rounded-3xl">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-xs font-black text-white">{value}</span>
    </div>
  );
}
