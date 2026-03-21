'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Linkedin, User, Phone, Send, Swords } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AvatarDropdown from '@/components/ui/AvatarDropdown';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function ContactPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Swords size={16} className="text-white" />
          </div>
          <span className="text-base font-black italic tracking-tighter uppercase">Guessing Duel</span>
        </Link>

        {/* Middle Links */}
        <div className="hidden md:flex items-center gap-8 lg:gap-12">
          <Link href="/buy" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-400 transition-all underline-offset-8 hover:underline">Buy</Link>
          <Link href="/leaderboard" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-400 transition-all underline-offset-8 hover:underline">Leaderboard</Link>
          <Link href="/contact" className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 transition-all underline-offset-8 underline">Contact Us</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? <AvatarDropdown /> : (
            <Button size="md" onClick={() => router.push('/login')} className="h-9 px-5 text-xs font-bold">Play Now</Button>
          )}
        </div>
      </nav>

      <section className="relative z-10 pt-20 pb-24 px-6 max-w-4xl mx-auto flex justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center md:text-left space-y-12"
        >
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-[0.85] mb-8">
              Send a <br />
              <span className="text-blue-500">Transmission.</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-xl">
              Connect with the creator or share your feedback directly. All signals are routed to the founder's secure line.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 md:gap-12">
            <ContactLink icon={<Mail />} title="Official Email" value="hari@edzy.ai" href="mailto:hari@edzy.ai" />
            <ContactLink icon={<Linkedin />} title="LinkedIn" value="Hari Krishna Chenna" href="https://linkedin.com/in/hari-krishna-chenna-54014124b" />
            <ContactLink icon={<User />} title="Founder Profile" value="View Portfolio" href="https://portfolio-hari-krishna-12.vercel.app/" />
            <ContactLink icon={<Phone />} title="Contact Number" value="+91 6301374802" href="tel:+916301374802" />
          </div>
        </motion.div>
      </section>

      <footer className="mt-12 p-12 text-center">
        <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em]">Signal Received • 2024</p>
      </footer>
    </main>
  );
}

function ContactLink({ icon, title, value, href }: { icon: React.ReactNode, title: string, value: string, href?: string }) {
  const content = (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1">{title}</p>
        <p className="text-xs font-black text-slate-200 group-hover:text-blue-400 transition-colors">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>;
  }

  return content;
}
