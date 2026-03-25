'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Shield, Trophy, ArrowRight, ChevronLeft, ChevronRight, Hash, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';

interface OnboardingSlidesProps {
  onComplete: () => void;
}

const slides = [
  {
    title: "Welcome to MindMatch",
    description: "The ultimate race of intuition and strategy. Challenge your mind in real-time battles.",
    icon: Brain,
    color: "from-blue-600 to-blue-400",
    glow: "shadow-blue-500/20"
  },
  {
    title: "Set Your Secret",
    description: "Choose a secret number or word. Your goal? Guess theirs before they uncover yours.",
    icon: Shield,
    color: "from-purple-600 to-purple-400",
    glow: "shadow-purple-500/20"
  },
  {
    title: "Master the Modes",
    description: "From quick Numeric sprints to deep Word Match puzzles. Every mode is a new challenge.",
    icon: Zap,
    color: "from-orange-600 to-orange-400",
    glow: "shadow-orange-500/20"
  },
  {
    title: "Claim Your Throne",
    description: "Climb the global ranks and earn coins. Login now to save your progress and start winning.",
    icon: Trophy,
    color: "from-yellow-600 to-yellow-400",
    glow: "shadow-yellow-500/20"
  }
];

const OnboardingSlides: React.FC<OnboardingSlidesProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide === slides.length - 1) {
      onComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col p-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          key={currentSlide}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-gradient-to-br ${slide.color} opacity-[0.03] rounded-full blur-[120px]`}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className={`w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br ${slide.color} rounded-[2.5rem] flex items-center justify-center shadow-2xl ${slide.glow}`}
          >
            <slide.icon size={64} className="text-white drop-shadow-lg" />
          </motion.div>
        </AnimatePresence>

        <div className="text-center space-y-4 max-w-xs">
          <AnimatePresence mode="wait">
            <motion.h2 
              key={currentSlide + 'title'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-3xl font-black text-white tracking-tighter uppercase leading-none"
            >
              {slide.title}
            </motion.h2>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p 
              key={currentSlide + 'desc'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-slate-400 text-sm font-bold leading-relaxed"
            >
              {slide.description}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Indicators */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-blue-500' : 'w-1.5 bg-slate-800'}`} 
            />
          ))}
        </div>
      </div>

      <div className="h-24 flex items-center justify-between gap-4 relative z-10">
        <Button 
          variant="secondary" 
          onClick={prevSlide}
          className={`h-14 w-14 rounded-2xl flex items-center justify-center p-0 ${currentSlide === 0 ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <ChevronLeft size={24} />
        </Button>

        <Button 
          onClick={nextSlide}
          fullWidth
          className="h-14 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center"
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
          <ArrowRight className="ml-2" size={20} />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingSlides;
