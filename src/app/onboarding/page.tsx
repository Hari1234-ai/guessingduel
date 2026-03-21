'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Camera, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, hasProfile, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.displayName && !name) {
      setName(user.displayName);
    }
    if (hasProfile) {
      router.push('/dashboard');
    }
  }, [user, hasProfile, router, name]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name) return;

    setIsSubmitting(true);
    try {
      let photoURL = '';
      if (image && storage) {
        const storageRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(storageRef, image);
        photoURL = await getDownloadURL(storageRef);
      }

      const userData = {
        name,
        photoURL,
        email: user.email,
        createdAt: new Date().toISOString(),
        stats: {
          wins: 0,
          losses: 0,
          totalDuels: 0
        }
      };

      if (db) {
        await setDoc(doc(db, 'users', user.uid), userData);
        await refreshProfile();
        router.push('/dashboard');
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-xl relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600/20 rounded-2xl mb-4 border border-blue-500/20">
            <User className="text-blue-400" size={24} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase italic mb-2">Set Your Profile</h1>
          <p className="text-slate-400 text-sm">Welcome to the duel. How should we call you?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-[2rem] bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-500/50">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="text-slate-500" size={32} />
                )}
              </div>
              <label 
                htmlFor="avatar-upload"
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-2xl border-4 border-slate-950 flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/40"
              >
                <PlusIcon size={18} className="text-white" />
              </label>
              <input 
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <p className="mt-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Optional Avatar</p>
          </div>

          <div className="space-y-4">
            <Input
              label="What represents you?"
              placeholder="Your Name / Legend Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 text-center text-lg font-bold"
              labelClassName="text-[10px] text-center mb-2"
            />
          </div>

          <Button 
            size="lg" 
            fullWidth 
            type="submit" 
            disabled={!name || isSubmitting}
            className="h-14 text-sm font-black group"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Confirm Personality
                <Sparkles size={16} className="ml-2 group-hover:fill-current" />
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </main>
  );
}

function PlusIcon({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
