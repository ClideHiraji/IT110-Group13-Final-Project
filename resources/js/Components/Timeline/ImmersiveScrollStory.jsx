import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import HeroSection from './HeroSection';
import PeriodChapter from './PeriodChapter';
import MinimalProgress from './MinimalProgress';
import ThreeBackground from '../ThreeBackground';
import TimelineClosing from './TimelineClosing';

/**
 * ImmersiveScrollStory Component
 * 
 * Main timeline container that orchestrates the entire scroll-based storytelling experience.
 * Manages intro animation, loading states, period navigation, and coordinates all child components.
 * 
 * @param {Array} periods - Array of art period objects containing metadata and styling
 * @param {Object} timelineData - Artwork data organized by period ID
 * @param {Function} onArtworkClick - Callback function when an artwork is clicked
 * @param {boolean} isLoading - Whether artwork data is still being fetched
 * @param {Array} savedArtworks - Array of saved artwork IDs for user's collection
 * @param {Function} onSaveArtwork - Callback function to save an artwork to collection
 * @param {Function} onRemoveArtwork - Callback function to remove artwork from collection
 */
export default function ImmersiveScrollStory({ 
  periods, 
  timelineData,
  onArtworkClick, 
  isLoading,
  savedArtworks = [],
  onSaveArtwork,
  onRemoveArtwork
}) {
  // Ref: Container element for scroll tracking
  const containerRef = useRef(null);
  
  // State: Index of currently active period (based on scroll position)
  const [currentPeriod, setCurrentPeriod] = useState(0);
  
  // State: Whether to display intro loading animation
  const [showIntro, setShowIntro] = useState(true);
  
  // State: Whether minimum intro display time (3 seconds) has elapsed
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  
  // Setup scroll progress tracking for the entire container
  // Used for parallax and fade effects in child components
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Effect: Ensure intro shows for minimum 3 seconds
  // Provides smooth user experience even if data loads quickly
  useEffect(() => {
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 3000);

    // Cleanup: Clear timeout if component unmounts
    return () => clearTimeout(minTimer);
  }, []);

  // Effect: Hide intro only when BOTH conditions are met
  // Condition 1: Data has finished loading (!isLoading)
  // Condition 2: Minimum display time has elapsed (minTimeElapsed)
  useEffect(() => {
    if (!isLoading && minTimeElapsed) {
      // Delay hiding by 500ms for smooth transition
      setTimeout(() => {
        setShowIntro(false);
      }, 500);
    }
  }, [isLoading, minTimeElapsed]);

  // Effect: Track scroll position to determine which period is currently active
  // Updates currentPeriod based on vertical scroll distance
  useEffect(() => {
    const handleScroll = () => {
      // Get current vertical scroll position
      const scrollPos = window.scrollY;
      // Get viewport height for calculations
      const windowHeight = window.innerHeight;
      // Each period section is 3 viewport heights tall
      // Calculate which period index based on scroll distance
      const periodIndex = Math.floor(scrollPos / (windowHeight * 3));
      // Ensure index doesn't exceed available periods
      setCurrentPeriod(Math.min(periodIndex, periods.length - 1));
    };

    // Attach scroll listener to window
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup: Remove scroll listener when component unmounts
    return () => window.removeEventListener('scroll', handleScroll);
  }, [periods]);


  return (
    <div ref={containerRef} className="relative bg-black min-h-screen">
      {/* 3D Background Layer */}
      {/* Fixed Three.js animated background, non-interactive */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ThreeBackground />
      </div>

      {/* Intro Loading Animation */}
      {/* AnimatePresence enables exit animations when showIntro becomes false */}
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
              {/* Multi-layered rotating rings with central rotating cube */}
              <div className="relative w-40 h-40 mx-auto mb-12">
                {/* Outer ring - rotates clockwise */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-0 border-[3px] border-amber-500/20 border-t-amber-500 rounded-full"
                />
                
                {/* Middle ring - rotates counter-clockwise */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-6 border-[3px] border-orange-500/20 border-t-orange-500 rounded-full"
                />
                
                {/* Center rotating cube - scales and rotates */}
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

                {/* Floating accent particle - top right */}
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
                
                {/* Floating accent particle - bottom left */}
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
              
              {/* Loading screen title with gradient text */}
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
              
              {/* Dynamic status text based on loading state */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-gray-400 text-xl mb-8"
              >
                {/* Show different messages based on loading progress */}
                {isLoading 
                  ? 'Curating your art collection...' 
                  : minTimeElapsed 
                    ? 'Ready! Entering timeline...' 
                    : 'Preparing experience...'}
              </motion.p>

              {/* Animated progress bar */}
              <motion.div 
                className="w-72 mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {/* Progress bar container */}
                <div className="h-1.5 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
                  {/* Animated progress fill */}
                  <motion.div
                    initial={{ width: "0%" }}
                    // Progress to 85% while loading, jumps to 100% when done
                    animate={{ 
                      width: isLoading ? "85%" : "100%"
                    }}
                    transition={{ 
                      // Slow progress during loading, quick complete when done
                      duration: isLoading ? 20 : 0.5,
                      ease: isLoading ? "easeOut" : "easeInOut"
                    }}
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 shadow-lg shadow-amber-500/50"
                  />
                </div>
              </motion.div>

              {/* Additional loading message when fetching data */}
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

      {/* Main Timeline Content */}
      {/* Only renders after intro animation completes */}
      {!showIntro && (
        <>
          {/* Hero Section - Opening section with scroll parallax */}
          <HeroSection scrollYProgress={scrollYProgress} disableInitialAnimation />

          {/* Period Chapters - Render each art period as a chapter */}
          {periods.map((period, index) => (
            <PeriodChapter
              key={period.id}
              period={period}
              // Get artworks for this period from timelineData object, fallback to empty array
              artworks={(timelineData && timelineData[period.id]) || []}
              // Wrap onArtworkClick to include period.id
              onArtworkClick={(artwork) => onArtworkClick(artwork, period.id)}
              // Chapter is active when its index matches current scroll position
              isActive={currentPeriod === index}
              index={index}
              // Pass through collection management props to child components
              savedArtworks={savedArtworks}
              onSaveArtwork={onSaveArtwork}
              onRemoveArtwork={onRemoveArtwork}
            />
          ))}

          {/* Progress Indicator - Sidebar showing current position in timeline */}
          <MinimalProgress periods={periods} currentPeriod={currentPeriod} />
          
          {/* Closing Section - Final section with call-to-action */}
          <TimelineClosing />
        </>
      )}
    </div>
  );
}
