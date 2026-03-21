'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Twitter, Github, Send, Swords } from 'lucide-react';
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
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Swords size={18} className="text-white" />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase">Guessing Duel</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? <AvatarDropdown /> : (
            <Button size="md" onClick={() => router.push('/login')} className="h-10 px-6 font-bold">Play Now</Button>
          )}
        </div>
      </nav>

      <section className="relative z-10 pt-20 pb-24 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-[0.85] mb-8">
              Send a <br />
              <span className="text-blue-500">Transmission.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-12">
              Have questions, feedback, or a business proposal? Our team of duel-masters is ready to listen.
            </p>

            <div className="space-y-6">
              <ContactLink icon={<Mail />} title="Support Email" value="support@guessingduel.com" />
              <ContactLink icon={<Twitter />} title="X / Twitter" value="@guessingduel" />
              <ContactLink icon={<MessageSquare />} title="Discord" value="GuessingDuel#Official" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem] backdrop-blur-xl shadow-2xl"
          >
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Name" placeholder="Maverick" className="h-12 font-bold" />
                <Input label="Email" placeholder="m@duel.com" className="h-12 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Message</label>
                <textarea 
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-sm font-bold h-32 focus:border-blue-500/50 outline-none transition-all resize-none"
                  placeholder="Tell us what's on your mind challenger..."
                />
              </div>
              <Button fullWidth size="lg" className="h-14 font-black group shadow-lg shadow-blue-900/20">
                Send Message
                <Send className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={18} />
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      <footer className="mt-12 p-12 text-center">
        <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em]">Signal Received • 2024</p>
      </footer>
    </main>
  );
}

function ContactLink({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1">{title}</p>
        <p className="text-sm font-black text-slate-200 group-hover:text-blue-400 transition-colors uppercase italic">{value}</p>
      </div>
    </div>
  )
}
