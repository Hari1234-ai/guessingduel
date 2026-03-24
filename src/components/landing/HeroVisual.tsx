'use client';

import React from 'react';
import { motion } from 'framer-motion';

const HeroVisual = () => {
  return (
    <div className="absolute inset-x-0 top-0 h-[600px] md:h-[800px] flex items-center justify-center overflow-hidden pointer-events-none opacity-40 md:opacity-50">
      <div className="relative w-full max-w-[1400px] h-full flex items-center justify-center px-4">
        {/* Connection Beam (Thought Path) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent blur-sm" />
        
        {/* Animated Particles flowing between them */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl overflow-hidden h-32">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: i % 2 === 0 ? '-10%' : '110%', opacity: 0 }}
              animate={{ 
                x: i % 2 === 0 ? '110%' : '-10%',
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "linear"
              }}
              className={`absolute top-1/2 w-1.5 h-1.5 rounded-full blur-[2px] ${
                i % 2 === 0 ? 'bg-blue-400' : 'bg-purple-400'
              }`}
              style={{ top: `${10 + Math.random() * 80}%` }}
            />
          ))}
          
          {/* Floating Numbers and Letters */}
          {['42', '?', 'W', '!', '7', 'X', 'A', '9'].map((char, i) => (
             <motion.div
                key={`char-${i}`}
                initial={{ x: i % 2 === 0 ? '-10%' : '110%', opacity: 0, scale: 0.5 }}
                animate={{ 
                  x: i % 2 === 0 ? '110%' : '-10%',
                  opacity: [0, 0.8, 0.8, 0],
                  scale: [0.5, 1.2, 0.5],
                  rotate: [0, 15, -15, 0]
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "linear"
                }}
                className="absolute top-1/2 text-[10px] md:text-sm font-black text-blue-500/40"
                style={{ top: `${Math.random() * 100}%` }}
              >
                {char}
              </motion.div>
          ))}
        </div>

        {/* Left Head */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute left-[2%] md:left-[5%] scale-[0.85] md:scale-[1.8] origin-left"
        >
          <div className="relative">
            {/* Spectral Head Shape */}
            <svg width="200" height="240" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_20px_rgba(59,130,246,0.3)] opacity-80">
              <path d="M40 80C40 35.8172 75.8172 0 120 0C164.183 0 200 35.8172 200 80C200 95.5492 195.548 110.124 187.842 122.463C174.521 143.791 160 165 160 190V210C160 226.569 146.569 240 130 240H110C93.4315 240 80 226.569 80 210V180C75 160 60 145 40 120C30 108 40 95 40 80Z" fill="url(#paint0_radial_head_left)" fillOpacity="0.2"/>
              <path d="M40 80C40 35.8172 75.8172 0 120 0C164.183 0 200 35.8172 200 80C200 95.5492 195.548 110.124 187.842 122.463C174.521 143.791 160 165 160 190V210C160 226.569 146.569 240 130 240H110C93.4315 240 80 226.569 80 210V180C75 160 60 145 40 120C30 108 40 95 40 80Z" stroke="url(#paint1_linear_head_left)" strokeWidth="2" strokeOpacity="0.5"/>
              <defs>
                <radialGradient id="paint0_radial_head_left" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(120 80) rotate(90) scale(160 140)">
                  <stop stopColor="#3B82F6" stopOpacity="0.8"/>
                  <stop offset="1" stopColor="#3B82F6" stopOpacity="0"/>
                </radialGradient>
                <linearGradient id="paint1_linear_head_left" x1="120" y1="0" x2="120" y2="240" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#60A5FA"/>
                  <stop offset="1" stopColor="transparent"/>
                </linearGradient>
              </defs>
            </svg>
            
            {/* Glowing Brain Inside */}
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[30px] right-[40px] w-20 h-16 bg-blue-400 blur-xl rounded-full opacity-50" 
            />
            {/* Brain Pulse Activity */}
            <div className="absolute top-[35px] right-[45px]">
               {[...Array(5)].map((_, i) => (
                 <motion.div
                  key={i}
                  animate={{ 
                    scale: [0, 1.5],
                    opacity: [0.5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4
                  }}
                  className="absolute w-10 h-10 border border-blue-400 rounded-full"
                 />
               ))}
            </div>
          </div>
        </motion.div>

        {/* Right Head (Flipped) */}
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute right-[2%] md:right-[5%] scale-[0.85] md:scale-[1.8] origin-right"
        >
          <div className="relative scale-x-[-1]">
            <svg width="200" height="240" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_20px_rgba(168,85,247,0.3)] opacity-80">
              <path d="M40 80C40 35.8172 75.8172 0 120 0C164.183 0 200 35.8172 200 80C200 95.5492 195.548 110.124 187.842 122.463C174.521 143.791 160 165 160 190V210C160 226.569 146.569 240 130 240H110C93.4315 240 80 226.569 80 210V180C75 160 60 145 40 120C30 108 40 95 40 80Z" fill="url(#paint0_radial_head_right)" fillOpacity="0.2"/>
              <path d="M40 80C40 35.8172 75.8172 0 120 0C164.183 0 200 35.8172 200 80C200 95.5492 195.548 110.124 187.842 122.463C174.521 143.791 160 165 160 190V210C160 226.569 146.569 240 130 240H110C93.4315 240 80 226.569 80 210V180C75 160 60 145 40 120C30 108 40 95 40 80Z" stroke="url(#paint1_linear_head_right)" strokeWidth="2" strokeOpacity="0.5"/>
              <defs>
                <radialGradient id="paint0_radial_head_right" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(120 80) rotate(90) scale(160 140)">
                  <stop stopColor="#A855F7" stopOpacity="0.8"/>
                  <stop offset="1" stopColor="#A855F7" stopOpacity="0"/>
                </radialGradient>
                <linearGradient id="paint1_linear_head_right" x1="120" y1="0" x2="120" y2="240" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#C084FC"/>
                  <stop offset="1" stopColor="transparent"/>
                </linearGradient>
              </defs>
            </svg>
            
            {/* Glowing Brain Inside */}
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute top-[30px] right-[40px] w-20 h-16 bg-purple-400 blur-xl rounded-full opacity-50" 
            />
             {/* Brain Pulse Activity */}
             <div className="absolute top-[35px] right-[45px]">
               {[...Array(5)].map((_, i) => (
                 <motion.div
                  key={i}
                  animate={{ 
                    scale: [0, 1.5],
                    opacity: [0.5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4 + 1
                  }}
                  className="absolute w-10 h-10 border border-purple-400 rounded-full"
                 />
               ))}
            </div>
          </div>
        </motion.div>

        {/* Central Pulse (Where minds meet) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-500/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
};

export default HeroVisual;
