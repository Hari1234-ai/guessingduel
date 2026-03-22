import React from 'react';
import Link from 'next/link';
import { Swords } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-12 px-6 border-t border-white/5 bg-slate-950/50 backdrop-blur-md mt-auto relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Logo/Icon Area */}
        <div className="flex items-center gap-3 mb-8 group cursor-default">
          <div className="w-10 h-10 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-center grayscale group-hover:grayscale-0 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-500 shadow-lg shadow-black/50">
            <Swords size={20} className="text-slate-500 group-hover:text-white transition-colors" />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase italic text-slate-400 group-hover:text-white transition-colors">
            Guessing Duel
          </span>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mb-12 text-center md:text-left">
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2">Platform</h4>
            <Link href="/setup" className="text-xs font-bold text-slate-500 hover:text-blue-400 transition-all">Play Duel</Link>
            <Link href="/leaderboard" className="text-xs font-bold text-slate-500 hover:text-blue-400 transition-all">Leaderboard</Link>
            <Link href="/buy" className="text-xs font-bold text-slate-500 hover:text-blue-400 transition-all">Plans</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2">Legal</h4>
            <Link href="/privacy" className="text-xs font-bold text-slate-500 hover:text-blue-400 transition-all">Privacy Policy</Link>
            <Link href="/terms" className="text-xs font-bold text-slate-500 hover:text-blue-400 transition-all">Terms of Service</Link>
            <Link href="/sitemap.xml" className="text-xs font-bold text-slate-500 hover:text-blue-400 transition-all">Sitemap</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2">Support</h4>
            <Link href="/contact" className="text-xs font-bold text-slate-500 hover:text-blue-400 transition-all">Contact Us</Link>
            <Link href="/faq" className="text-xs font-bold text-slate-500 hover:text-blue-400 transition-all opacity-50 cursor-not-allowed">Help Center</Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="w-full pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
            © {currentYear} Guessing Duel. Built for competitive spirits.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
