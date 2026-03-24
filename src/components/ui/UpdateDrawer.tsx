'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Sparkles, ArrowUpCircle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { LOCAL_VERSION } from '@/lib/version';

export default function UpdateDrawer() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only check for updates on native Android/iOS platforms
    if (!Capacitor.isNativePlatform()) return;

    const checkUpdate = async () => {
      try {
        const response = await fetch('https://mindm.vercel.app/api/version.json', {
          cache: 'no-store'
        });
        const data = await response.json();

        if (data.latestVersion !== LOCAL_VERSION) {
          setLatestVersion(data.latestVersion);
          setReleaseNotes(data.releaseNotes);
          setUpdateAvailable(true);
          // Show after a slight delay for better UX
          setTimeout(() => setIsVisible(true), 2000);
        }
      } catch (error) {
        console.error('Update check failed:', error);
      }
    };

    checkUpdate();
  }, []);

  const handleUpdate = () => {
    window.open('https://mindm.vercel.app/MindMatch.apk', '_blank');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <React.Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={() => setIsVisible(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#020817] border-t border-[#1985a1]/30 rounded-t-[2.5rem] px-6 pb-12 pt-8 shadow-[0_-20px_50px_-12px_rgba(25,133,161,0.3)]"
          >
            {/* Handle */}
            <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8" />

            <div className="max-w-md mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-[#1985a1]/20 rounded-2xl">
                  <ArrowUpCircle className="text-[#1985a1]" size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">New Update Available!</h3>
                  <p className="text-[#1985a1] font-medium tracking-wide">Version {latestVersion}</p>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50">
                  <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm font-semibold uppercase tracking-widest">
                    <Sparkles size={14} className="text-[#1985a1]" />
                    What's New
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm">
                    {releaseNotes || "Performance improvements and bug fixes."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleUpdate}
                  className="w-full bg-[#1985a1] hover:bg-[#1985a1]/90 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-[#1985a1]/20"
                >
                  <Download size={20} />
                  UPDATE MINDMATCH NOW
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="w-full py-4 text-slate-500 font-medium text-sm hover:text-slate-300 transition-colors"
                >
                  NOT NOW
                </button>
              </div>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
