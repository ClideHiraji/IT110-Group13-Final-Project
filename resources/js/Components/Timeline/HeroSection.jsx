import React from 'react';
import { motion, useTransform } from 'framer-motion';

/**
 * HeroSection Component
 * 
 * Opening hero section for the timeline with scroll-based parallax effects.
 * Features animated title, subtitle, and floating particle background.
 * 
 * @param {Object} scrollYProgress - Framer Motion scroll progress object for parallax effects
 * @param {boolean} disableInitialAnimation - Whether to disable entrance animations (default: false)
 */
export default function HeroSection({ scrollYProgress, disableInitialAnimation = false }) {
  // Transform scroll progress (0-0.1) into scale value (1-1.5) for zoom effect
  // As user scrolls, content gradually scales up creating parallax depth
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 1.5]);
  
  // Transform scroll progress (0-0.15) into opacity value (1-0) for fade out
  // Content fades out as user scrolls down, transitioning to next section
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);


  return (
    <motion.section 
      // Apply scroll-based opacity fade
      style={{ opacity }}
      className="relative z-10 h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Main content container with scroll-based scale effect */}
      <motion.div 
        // Apply scroll-based scale for parallax zoom
        style={{ scale }}
        className="text-center z-10 px-6"
      >
        {/* Main hero title with gradient text */}
        <motion.h1
          // Conditional initial animation: skip if disabled, otherwise start from invisible/offset position
          initial={disableInitialAnimation ? {} : { opacity: 0, y: 30 }}
          // Animate to fully visible and centered position
          animate={{ opacity: 1, y: 0 }}
          // Fade in over 1 second with 0.3s delay
          transition={{ duration: 1, delay: 0.3 }}
          className="text-7xl md:text-9xl font-bold mb-6"
        >
          {/* Gradient text from amber to orange creating warm glow effect */}
          <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-200 bg-clip-text text-transparent">
            Art is a Portal
          </span>
        </motion.h1>
        
        {/* Subtitle text with fade-in animation */}
        <motion.p
          // Conditional initial animation: skip if disabled, otherwise start from invisible/offset position
          initial={disableInitialAnimation ? {} : { opacity: 0, y: 30 }}
          // Animate to fully visible and centered position
          animate={{ opacity: 1, y: 0 }}
          // Fade in over 1 second with 0.8s delay (after title)
          transition={{ duration: 1, delay: 0.8 }}
          className="text-gray-400 text-xl md:text-2xl mb-12"
        >
          Scroll to explore masterpieces through time
        </motion.p>
        
        {/* Animated scroll indicator arrow */}
        <motion.div
          // Bounce animation: move up 15px and back continuously
          animate={{ y: [0, 15, 0] }}
          // 2 second loop, repeats infinitely
          transition={{ duration: 2, repeat: Infinity }}
          className="text-amber-400 text-6xl"
        >
          ↓
        </motion.div>
      </motion.div>


      {/* Particle Background */}
      {/* Layer of 50 floating animated particles for ambient effect */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Generate array of 50 particles */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/20 rounded-full"
            style={{
              // Random horizontal position across entire width
              left: `${Math.random() * 100}%`,
              // Random vertical position across entire height
              top: `${Math.random() * 100}%`,
            }}
            // Animate particle: float up 50px and back, pulse opacity
            animate={{
              y: [0, -50, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            // Each particle has unique timing for organic feel
            transition={{
              // Duration: 3-5 seconds (randomized)
              duration: 3 + Math.random() * 2,
              // Loop infinitely
              repeat: Infinity,
              // Random start delay: 0-2 seconds
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </motion.section>
  );
}
