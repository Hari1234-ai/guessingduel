'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { 
  verifyPasswordResetCode, 
  confirmPasswordReset,
  AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Lock, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (!oobCode) {
      setError('Invalid or missing reset link. Please try again.');
      return;
    }

    // Verify the code and get the email address
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setEmail(email);
      })
      .catch((err) => {
        console.error(err);
        setError('This reset link has expired or is invalid.');
      });
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      const authError = err as AuthError;
      setError(authError.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
        <p className="text-slate-400 mb-8">Your account security has been updated successfully.</p>
        <Button onClick={() => router.push('/login')} fullWidth size="lg">
          Go to Login
        </Button>
      </motion.div>
    );
  }

  return (
    <>
      <div className="flex justify-center mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
        Secure Reset
      </h1>
      <p className="text-slate-400 text-center mb-8">
        {email ? `Update password for ${email}` : 'Loading reset details...'}
      </p>

      {error ? (
        <div className="bg-red-400/10 border border-red-400/20 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-[3.2rem] translate-y-[-50%] text-slate-500 z-10" size={18} />
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="pl-12"
              disabled={!email || loading}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-[3.2rem] translate-y-[-50%] text-slate-500 z-10" size={18} />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pl-12"
              disabled={!email || loading}
            />
          </div>

          <Button 
            type="submit" 
            fullWidth 
            size="lg" 
            disabled={!email || loading}
            className="mt-6"
          >
            {loading ? 'Updating...' : 'Save Password'}
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <Suspense fallback={<div className="text-white text-center">Loading security context...</div>}>
          <ResetPasswordForm />
        </Suspense>

        <p className="mt-8 text-center text-xs text-slate-500">
          Secure connection established via Duel Guess Identity.
        </p>
      </motion.div>
    </div>
  );
}
