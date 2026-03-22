import React from 'react';
import Link from 'next/link';
import { Swords } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-16 px-6 border-t border-slate-900 bg-slate-950 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Logo/Icon */}
        <div className="mb-8 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
           <Swords size={32} className="text-blue-500" />
        </div>

        <div className="mb-4">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 leading-loose">
            © {currentYear} Guessing Duel <span className="mx-2 text-slate-800">|</span> The ultimate turn-based 2-player guessing game. <span className="block md:inline mt-1 md:mt-0">All rights reserved.</span>
          </p>
        </div>
        
        <p className="text-sm text-slate-600 max-w-2xl mb-10 leading-relaxed font-medium">
          Guessing Duel is a competitive platform where players test their intuition and strategy in real-time duels. 
          Challenge your friends and climb the leaderboard in this high-stakes battle of wits.
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
          <Link href="/privacy" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-400 transition-all">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-400 transition-all">
            Terms of Service
          </Link>
          <Link href="/contact" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-400 transition-all">
            Contact Support
          </Link>
        </div>
        
        <div className="mt-12 h-px w-12 bg-slate-900" />
      </div>
    </footer>
  );
}
