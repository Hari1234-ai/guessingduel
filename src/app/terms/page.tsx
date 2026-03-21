'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function TermsOfService() {
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
            <FileText className="text-blue-400" size={24} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Terms of Service</h1>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Guessing Duel, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Description of Service</h2>
            <p>Guessing Duel is a multiplayer web application that allows users to challenge each other in a number guessing game. The service is provided &quot;as is&quot; and we reserve the right to modify or terminate the service at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. User Conduct</h2>
            <p>You agree not to use the application for any unlawful purpose or to engage in any conduct that harms, threatens, or harasses other users. Cheating or exploiting vulnerabilities in the game logic is prohibited.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Intellectual Property</h2>
            <p>All content included in the application, such as text, graphics, logos, and code, is the property of Guessing Duel or its content suppliers and protected by copyright laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Limitation of Liability</h2>
            <p>Guessing Duel and its developers shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Changes to Terms</h2>
            <p>We reserve the right to update these Terms of Service at any time. We will notify you of any significant changes by posting the new terms on this page.</p>
          </section>

          <div className="pt-8 border-t border-slate-800">
            <p className="text-sm text-slate-500 italic">Last Updated: March 2024</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button onClick={() => router.push('/login')} variant="secondary">
            I understand, take me back
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
