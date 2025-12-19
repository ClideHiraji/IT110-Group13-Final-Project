import React from 'react';
import { motion } from 'framer-motion';

/**
 * MinimalProgress Component
 * 
 * Sidebar progress indicator that displays navigation dots for each period in the timeline.
 * Shows current position with animated dot, color-coded by period theme, and tooltip on hover.
 * 
 * @param {Array} periods - Array of period objects containing id, title, period, and color
 * @param {number} currentPeriod - Index of the currently active period based on scroll position
 */
export default function MinimalProgress({ periods, currentPeriod }) {
  return (
    // Fixed position sidebar on left side, vertically centered
    <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {/* Render a dot indicator for each period */}
      {periods.map((period, index) => (
        <motion.div
          key={period.id}
          className="relative group"
          // Animate scale and opacity based on whether this is the active period
          animate={{
            scale: currentPeriod === index ? 1.5 : 1,
            opacity: currentPeriod === index ? 1 : 0.3
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Main Dot */}
          {/* Circle indicator colored by period theme when active */}
          <div
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              // Active dot uses period color, inactive dots are semi-transparent white
              backgroundColor: currentPeriod === index ? period.color : '#ffffff40',
              // Active dot has glow effect matching period color
              boxShadow: currentPeriod === index ? `0 0 20px ${period.color}` : 'none'
            }}
          />
          
          {/* Pulse Effect for Active */}
          {/* Two expanding rings that pulse outward from active dot */}
          {currentPeriod === index && (
            <>
              {/* First pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ borderColor: period.color, borderWidth: '2px' }}
                initial={{ scale: 1, opacity: 1 }}
                // Expands to 2.5x size while fading out
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
              {/* Second pulse ring with 0.5s delay for cascading effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ borderColor: period.color, borderWidth: '2px' }}
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.5
                }}
              />
            </>
          )}
          
          {/* Hover Tooltip */}
          {/* Information card that appears when hovering over a dot */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            {/* Tooltip card with period information */}
            <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded px-3 py-1.5 shadow-lg">
              <div className="text-left">
                {/* Period title (e.g., "Renaissance") */}
                <p className="text-white text-xs font-semibold">{period.title}</p>
                {/* Period time range (e.g., "1400-1600") */}
                <p className="text-gray-400 text-[10px]">{period.period}</p>
              </div>
            </div>
            
            {/* Arrow pointing to dot */}
            {/* Triangular pointer connecting tooltip to dot */}
            <div 
              className="absolute right-full top-1/2 -translate-y-1/2 mr-[1px] w-0 h-0"
              style={{
                borderTop: '4px solid transparent',
                borderBottom: '4px solid transparent',
                borderRight: '4px solid rgba(0,0,0,0.9)'
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}