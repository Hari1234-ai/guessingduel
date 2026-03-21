'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasProfile: boolean;
  profileData: {
    name: string;
    email: string;
    photoURL?: string;
    coins: number;
    weeklyCoins: number;
    lastResetWeek: string;
    createdAt: any;
  } | null;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkProfile = async (uid: string) => {
    if (!db) {
      setHasProfile(false);
      return false;
    }
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData(data);
        setHasProfile(true);
        return true;
      }
      setHasProfile(false);
      return false;
    } catch (error) {
      console.error("Error checking profile:", error);
      setHasProfile(false);
      return false;
    }
  };

  const refreshProfile = async () => {
    if (user) await checkProfile(user.uid);
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      const publicRoutes = ['/', '/login', '/privacy', '/terms', '/reset-password', '/buy', '/leaderboard', '/history', '/contact'];
      const isPublicRoute = publicRoutes.includes(pathname);

      if (user) {
        const exists = await checkProfile(user.uid);
        setLoading(false);
        
        if (!exists && pathname !== '/onboarding') {
          router.push('/onboarding');
        } else if (exists && pathname === '/onboarding') {
          router.push('/setup');
        } else if (pathname === '/login') {
          router.push('/setup');
        }
      } else {
        setHasProfile(false);
        setProfileData(null);
        setLoading(false);
        
        if (!isPublicRoute) {
          router.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const logout = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, hasProfile, profileData, logout, refreshProfile }}>
      {(!loading || pathname === '/') && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
