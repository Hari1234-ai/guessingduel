'use client';

import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  AuthError,
  getRedirectResult,
  signInWithCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, Lock, ShieldCheck, ArrowRight, UserPlus, LogIn, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const router = useRouter();

  React.useEffect(() => {
    if (!auth) return;
    
    // Check if we just returned from a Google redirect
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          router.push('/');
        }
      })
      .catch((err) => {
        console.error("Redirect error:", err);
        setError("Sign-in failed during redirect. Please try again.");
      });
  }, [router]);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    setResetSuccess('');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSuccess('Password reset link sent! Check your inbox.');
    } catch (err) {
      console.error(err);
      const authError = err as AuthError;
      if (authError.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (err) {
      console.error(err);
      const authError = err as AuthError;
      
      switch (authError.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          if (mode === 'login') {
            // Auto-switch to signup mode with a helpful prompt
            setMode('signup');
            setError('No account found with this email. We\'ve switched to Sign Up — just confirm your password to create an account!');
          } else {
            setError('Sign up failed. Please try again.');
          }
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/email-already-in-use':
          setError('An account already exists with this email. Please sign in instead.');
          setMode('login');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Please wait a moment and try again.');
          break;
        default:
          setError('Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      
      if (Capacitor.isNativePlatform()) {
        // Native Android/iOS Sign-in
        const result = await FirebaseAuthentication.signInWithGoogle();
        if (result.credential?.idToken) {
          const credential = GoogleAuthProvider.credential(result.credential.idToken);
          await signInWithCredential(auth, credential);
          router.push('/');
        }
      } else {
        // Web Browser Sign-in
        provider.setCustomParameters({
          prompt: 'select_account'
        });
        await signInWithPopup(auth, provider);
        router.push('/');
      }
    } catch (err) {
      console.error(err);
      const authError = err as AuthError;
      if (authError.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden transition-colors duration-300">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[22rem] bg-card backdrop-blur-xl border border-card-border p-6 rounded-[1.5rem] shadow-2xl relative z-10"
        >

          <h1 className="text-xl font-bold text-center mb-1 bg-gradient-to-r from-foreground to-slate-400 bg-clip-text text-transparent">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-400 text-center mb-6 text-xs">
            {mode === 'login'
              ? 'Login to challenge your rivals'
              : 'Join the match and start winning'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail size={16} />}
              className="h-10 text-sm"
              labelClassName="text-[10px] mb-1"
            />

            <div className="flex flex-col">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leftIcon={<Lock size={16} />}
                showPasswordToggle
                className="h-10 text-sm"
                labelClassName="text-[10px] mb-1"
              />
              {mode === 'login' && (
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {(error || resetSuccess) && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`text-sm font-medium text-center py-2 rounded-lg border ${
                    resetSuccess
                      ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                      : 'text-red-400 bg-red-400/10 border-red-400/20'
                  }`}
                >
                  {resetSuccess || error}
                </motion.p>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="mt-6 h-10 text-sm"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Sign Up'}
                  <ArrowRight className="ml-2" size={16} />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-light"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-background px-4 text-muted-foreground font-bold tracking-widest">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={handleGoogleLogin}
            disabled={loading}
            className="bg-secondary hover:bg-secondary-hover text-foreground border border-border-light shadow-lg h-10 text-sm"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>

          <div className="mt-8 pt-6 border-t border-border-light flex flex-col gap-4">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
            >
              {mode === 'login' ? (
                <>
                  <UserPlus size={16} />
                  New here? <span className="text-blue-400">Create an account</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Already have an account? <span className="text-blue-400">Sign in</span>
                </>
              )}
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-slate-500 space-x-2">
            <span>By continuing, you agree to our</span>
            <Link href="/terms" className="text-slate-400 hover:text-blue-400 underline transition-colors">Terms of Service</Link>
            <span>and</span>
            <Link href="/privacy" className="text-slate-400 hover:text-blue-400 underline transition-colors">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
