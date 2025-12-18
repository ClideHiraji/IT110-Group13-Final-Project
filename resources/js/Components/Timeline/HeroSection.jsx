// resources/js/Components/Timeline/HeroSection.jsx

import React from 'react';
import { motion, useTransform } from 'framer-motion';

export default function HeroSection({ scrollYProgress, disableInitialAnimation = false }) {
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 1.5]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <motion.section 
      style={{ opacity }}
      className="relative z-10 h-screen flex items-center justify-center overflow-hidden"
    >
      <motion.div 
        style={{ scale }}
        className="text-center z-10 px-6"
      >
        <motion.h1
           initial={disableInitialAnimation ? {} : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-7xl md:text-9xl font-bold mb-6"
        >
          <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-200 bg-clip-text text-transparent">
            Art is a Portal
          </span>
        </motion.h1>
        
        <motion.p
           initial={disableInitialAnimation ? {} : { opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-gray-400 text-xl md:text-2xl mb-12"
        >
          Scroll to explore masterpieces through time
        </motion.p>
        
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-amber-400 text-6xl"
        >
          ↓
        </motion.div>
      </motion.div>

      {/* Particle Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </motion.section>
  );
}