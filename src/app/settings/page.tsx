'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Save, ArrowLeft, Loader2, Shield, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AvatarDropdown from '@/components/ui/AvatarDropdown';

export default function SettingsPage() {
  const router = useRouter();
  const { user, profileData, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profileData) {
      setName(profileData.name || '');
    }
  }, [profileData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    setIsSubmitting(true);
    try {
      if (db) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          name: name.trim(),
          updatedAt: new Date().toISOString()
        });
        await refreshProfile();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const firstLetter = name?.charAt(0).toUpperCase() || 'P';

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px]" />

      {/* Global Avatar */}
      <div className="fixed top-6 right-6 z-50">
        <AvatarDropdown />
      </div>

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

        <div className="grid md:grid-cols-12 gap-12">
          {/* Side Nav */}
          <div className="md:col-span-4 space-y-2">
            <h1 className="text-3xl font-black tracking-tighter uppercase mb-8">Account</h1>
            <nav className="flex flex-col gap-1">
              <button className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-2xl border border-blue-500/20 font-bold text-sm text-left">
                <User size={18} />
                Profile Settings
              </button>
              <button disabled className="flex items-center gap-3 px-4 py-3 text-slate-600 rounded-2xl font-bold text-sm text-left cursor-not-allowed">
                <Shield size={18} />
                Security
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="md:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl"
            >
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Profile Avatar Section */}
                <div className="flex items-center gap-8">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-slate-700 flex items-center justify-center overflow-hidden shadow-lg shadow-blue-900/20 text-white font-black text-4xl">
                    {firstLetter}
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight">Active Identity</h3>
                    <p className="text-slate-500 text-xs">Generated from your display name.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <Input
                    label="Display Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="h-12 font-bold"
                  />
                  
                  <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Registered Email</label>
                    <p className="text-sm font-bold text-slate-300">{user?.email}</p>
                    <p className="text-[10px] text-slate-600 mt-2">Contact support to change your email.</p>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <Button 
                    type="submit" 
                    size="md" 
                    disabled={isSubmitting || !name.trim()}
                    className="h-12 px-8 font-black group"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : saveSuccess ? (
                      'Changes Saved!'
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        Update Profile
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>

            {/* Danger Zone */}
            <div className="mt-8 p-8 border border-red-900/20 bg-red-950/5 rounded-[2.5rem]">
              <h3 className="text-red-500 font-black uppercase tracking-tighter mb-2">Danger Zone</h3>
              <p className="text-slate-500 text-xs mb-6">Permanently delete your account and all Duel data.</p>
              <Button variant="secondary" className="border-red-900/20 text-red-500 hover:bg-red-500/10 h-10 text-xs">
                <Trash2 size={14} className="mr-2" /> Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
