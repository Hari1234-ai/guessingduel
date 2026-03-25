'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getBrandName, getActionName } from '@/lib/branding';
import Button from '@/components/ui/Button';

export default function Feedback() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const response = await fetch('https://formspree.io/f/xeerbwov', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setStatus('success');
        form.reset();
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      setStatus('error');
      setMessage('Failed to send. Please check your connection.');
    }
  };

  return (
    <section id="feedback" className="relative z-10 py-24 px-6 max-w-5xl mx-auto overflow-hidden">
      <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative bg-card border border-card-border rounded-[3rem] p-8 md:p-16 backdrop-blur-sm shadow-2xl overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-30" />
        
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <MessageSquare size={12} className="fill-current" />
              Feedback Loop
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-[0.9] text-white">
              Share Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Thoughts.</span>
            </h2>
            
            <p className="text-slate-400 text-sm leading-relaxed">
              We&apos;re building {getBrandName()} for you. Have a feature request, a bug to report, or just want to tell us how much you love the {getActionName().toLowerCase()}? We&apos;re listening.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <Sparkles size={16} className="text-blue-500" /> Influence the Roadmap
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <Sparkles size={16} className="text-purple-500" /> Report Battle Anomalies
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Name</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name" 
                    required 
                    placeholder={`Guest ${getBrandName()}ist`}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Email (Optional)</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email" 
                    placeholder={`${getActionName().toLowerCase()}ist@arena.com`}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Message</label>
                <textarea 
                  id="message"
                  name="message" 
                  required 
                  rows={4} 
                  placeholder="Tell us what's on your mind... feature ideas, feedback, or any bugs you found!"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-[2rem] px-6 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-700 resize-none"
                />
              </div>

              <input type="hidden" name="_to" value="hari.paraheights@gmail.com" />
              <input type="hidden" name="_subject" value={`New ${getBrandName()} Review/Suggestion`} />
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className={`w-full h-14 font-black uppercase tracking-widest md:tracking-[0.2em] transform transition-all active:scale-[0.98] text-xs md:text-sm ${
                    status === 'success' ? 'bg-green-600 text-white hover:bg-green-700' : 
                    status === 'error' ? 'bg-red-600 text-white hover:bg-red-700' : 
                    'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {status === 'loading' ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : status === 'success' ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} />
                      SENT SUCCESSFULLY
                    </div>
                  ) : status === 'error' ? (
                    <div className="flex items-center gap-2">
                      <AlertCircle size={18} />
                      TRY AGAIN
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send size={18} />
                      TRANSMIT MESSAGE
                    </div>
                  )}
                </Button>
                
                {status === 'error' && (
                  <p className="mt-2 text-center text-red-500 text-[10px] font-bold uppercase tracking-widest">{message}</p>
                )}
                
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
