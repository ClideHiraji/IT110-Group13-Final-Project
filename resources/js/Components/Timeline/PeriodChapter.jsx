// resources/js/Components/Timeline/PeriodChapter.jsx

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Carousel3D from './Carousel3D';

export default function PeriodChapter({ period, artworks, onArtworkClick, isActive, index }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Scroll-based opacity transforms
  const titleOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.3, 0.35], [0, 1, 1, 0]);
  const carouselOpacity = useTransform(scrollYProgress, [0.35, 0.45, 0.9, 1], [0, 1, 1, 0.7]);

  return (
    <section 
      ref={sectionRef}
      data-period-id={period.id}
      className="relative min-h-[300vh] z-10"
    >
      {/* ALWAYS-ON BLUR LAYER */}
      <div className="absolute inset-0 -z-20 bg-black/30 backdrop-blur-md backdrop-saturate-500" /> 

      {/* CHAPTER BACKGROUND IMAGE (fade only image, not blur)
      <motion.div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `url(${period.background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          // backdropFilter: isActive ? 'blur(12px)' : 'blur(8px)'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0.2 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />

      {/* Gradient Background */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: isActive ? 0.6 : 0,
          background: `radial-gradient(circle at center, ${period.color}20, transparent 70%)`
        }}
      />

      {/* Sticky Container */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        
        {/* Period Title Phase */}
        <motion.div
          style={{ opacity: titleOpacity }}
          className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="text-center px-6"
          >
            {/* Large Background Number */}
            <motion.span 
              className="text-[12rem] md:text-[16rem] font-bold opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: period.color }}
            >
              {String(index + 1).padStart(2, '0')}
            </motion.span>
            
            <div className="relative z-10">
              {/* Top Divider */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="h-px bg-gradient-to-r from-transparent via-white to-transparent mb-8 max-w-2xl mx-auto"
              />
              
              {/* Main Title */}
              <h2 className="text-5xl md:text-8xl font-bold mb-4">
                <span 
                  className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                  style={{ 
                    filter: `drop-shadow(0 0 30px ${period.color})`
                  }}
                >
                  {period.storyTitle || period.title}
                </span>
              </h2>
              
              {/* Period Label */}
              <motion.p 
                className="text-xl md:text-2xl mb-6"
                style={{ color: period.color }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
              >
                {period.period}
              </motion.p>

              {/* Narrative */}
              <motion.p 
                className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
              >
                {period.narrative}
              </motion.p>
              
              {/* Bottom Divider */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.7 }}
                viewport={{ once: true }}
                className="h-px bg-gradient-to-r from-transparent via-white to-transparent mt-8 max-w-2xl mx-auto"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* 3D Carousel Phase - CRITICAL: Ensure pointer events work */}
        <motion.div
          style={{ opacity: carouselOpacity }}
          className="absolute inset-0"
          // IMPORTANT: Allow pointer events to pass through to carousel
          pointerEvents={isActive ? 'auto' : 'none'}
        >
          <Carousel3D 
            artworks={artworks}
            period={period}
            onArtworkClick={onArtworkClick}
            isActive={isActive}
          />
        </motion.div>
      </div>

      {/* Ambient Particles */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                background: period.color,
                opacity: 0.3,
              }}
              animate={{
                y: [0, -50, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 5 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}