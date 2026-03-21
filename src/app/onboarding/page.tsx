'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, ArrowRight, Loader2, Sparkles, Swords } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, hasProfile, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if profile already exists
  useEffect(() => {
    if (hasProfile) {
      router.replace('/dashboard');
    }
  }, [hasProfile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    setIsSubmitting(true);
    try {
      if (db) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          name: name.trim(),
          email: user.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        await refreshProfile();
        router.push('/dashboard');
      }
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/40">
            <Swords className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none mb-4">
            Welcome, <br />
            <span className="text-blue-500">Challenger.</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-[280px] mx-auto">
            Choose your duelist name to enter the arena and start your legacy.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
          <section className="space-y-6">
            <div className="flex justify-center mb-2">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-slate-700 flex items-center justify-center text-3xl font-black italic text-white shadow-inner shadow-black/20">
                {name ? name.charAt(0).toUpperCase() : <User size={32} className="text-white/50" />}
              </div>
            </div>
            
            <Input
              label="What should we call you?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maverick"
              required
              id="name"
              className="h-12 font-bold text-center"
              autoFocus
            />
          </section>

          <Button 
            type="submit" 
            size="md" 
            fullWidth 
            disabled={isSubmitting || !name.trim()}
            className="h-14 text-sm font-black group shadow-lg shadow-blue-900/20"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Sparkles size={18} className="mr-2" />
                Initialize Profile
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] mt-8">
          Guarding your identity since 2024
        </p>
      </motion.div>
    </main>
  );
}
