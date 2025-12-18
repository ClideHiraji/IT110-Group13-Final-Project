// resources/js/Components/Timeline/ImmersiveScrollStory.jsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import HeroSection from './HeroSection';
import PeriodChapter from './PeriodChapter';
import MinimalProgress from './MinimalProgress';
import ThreeBackground from '../ThreeBackground';
import TimelineClosing from './TimelineClosing';

export default function ImmersiveScrollStory({ periods, artworksData, onArtworkClick, isLoading }) {
  const containerRef = useRef(null);
  const [currentPeriod, setCurrentPeriod] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // ✅ Ensure intro shows for minimum 3 seconds
  useEffect(() => {
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 3000);

    return () => clearTimeout(minTimer);
  }, []);

  // ✅ Hide intro only when BOTH conditions are met:
  // 1. Data is loaded (!isLoading)
  // 2. Minimum 3 seconds have passed (minTimeElapsed)
  useEffect(() => {
    if (!isLoading && minTimeElapsed) {
      // Small delay for smooth transition
      setTimeout(() => {
        setShowIntro(false);
      }, 500);
    }
  }, [isLoading, minTimeElapsed]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const windowHeight = window.innerHeight;
      const periodIndex = Math.floor(scrollPos / (windowHeight * 3));
      setCurrentPeriod(Math.min(periodIndex, periods.length - 1));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [periods]);

  return (
    <div ref={containerRef} className="relative bg-black min-h-screen">
      {/* 3D BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ThreeBackground />
      </div>

      {/* Intro Animation - Waits for data loading */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          >
            <motion.div className="text-center">
              {/* Animated Rotating Icon */}
              <div className="relative w-40 h-40 mx-auto mb-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-0 border-[3px] border-amber-500/20 border-t-amber-500 rounded-full"
                />
                
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-6 border-[3px] border-orange-500/20 border-t-orange-500 rounded-full"
                />
                
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    rotate: [0, 90, 0]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-lg transform rotate-45 shadow-2xl shadow-amber-500/50" />
                </motion.div>

                <motion.div
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 rounded-full blur-sm"
                />
                <motion.div
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatDelay: 0.5,
                    delay: 0.7
                  }}
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-orange-400 rounded-full blur-sm"
                />
              </div>
              
              <motion.h1 
                className="text-6xl md:text-7xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                  Journey Through Time
                </span>
              </motion.h1>
              
              {/* ✅ Dynamic subtitle based on loading state */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-gray-400 text-xl mb-8"
              >
                {isLoading 
                  ? 'Curating your art collection...' 
                  : minTimeElapsed 
                    ? 'Ready! Entering timeline...' 
                    : 'Preparing experience...'}
              </motion.p>

              {/* ✅ Loading bar shows real progress */}
              <motion.div 
                className="w-72 mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <div className="h-1.5 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ 
                      width: isLoading ? "85%" : "100%"
                    }}
                    transition={{ 
                      duration: isLoading ? 20 : 0.5,
                      ease: isLoading ? "easeOut" : "easeInOut"
                    }}
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 shadow-lg shadow-amber-500/50"
                  />
                </div>
              </motion.div>

              {/* ✅ Optional: Loading percentage (if you want to show progress) */}
              {isLoading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-500 text-sm mt-4"
                >
                  Loading artworks from Met Museum...
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showIntro && (
        <>
          <HeroSection scrollYProgress={scrollYProgress} disableInitialAnimation />

          {periods.map((period, index) => (
            <PeriodChapter
              key={period.id}
              period={period}
              artworks={(artworksData[period.id] || [])}
              onArtworkClick={onArtworkClick}
              isActive={currentPeriod === index}
              index={index}
            />
          ))}

          <MinimalProgress periods={periods} currentPeriod={currentPeriod} />
          <TimelineClosing />
        </>
      )}
    </div>
  );
}
