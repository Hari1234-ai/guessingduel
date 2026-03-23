'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-300 p-6 md:p-12 flex flex-col items-center">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl relative z-10"
      >
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to App
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
            <Shield className="text-blue-400" size={24} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Privacy Policy</h1>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
            <p>Welcome to Duel. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you use our application.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Data We Collect</h2>
            <p>We collect and process a limited amount of data to provide the game service:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Authentication Data:</strong> When you sign in via Google or email, we receive your email address and profile information (if provided by Google) to identify your account across sessions.</li>
              <li><strong>Game Data:</strong> We store your chosen display name and game results (wins/losses/scores) to provide the leaderboard and game history features.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Data</h2>
            <p>Your data is used solely for the following purposes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Providing and maintaining the Duel game service.</li>
              <li>Managing your account and providing customer support.</li>
              <li>Powering the real-time multiplayer functionality via Ably.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Data Sharing</h2>
            <p>We do not sell your personal data. We only share data with service providers necessary for the app to function, including:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Firebase (Google):</strong> For authentication and secure data storage.</li>
              <li><strong>Ably:</strong> For real-time communication between players.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your data at any time. You can delete your account by contacting us or through the account settings in the application (if available).</p>
          </section>

          <div className="pt-8 border-t border-slate-800">
            <p className="text-sm text-slate-500">Last Updated: March 2024</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button onClick={() => router.push('/login')} variant="secondary">
            Got it, take me back
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
