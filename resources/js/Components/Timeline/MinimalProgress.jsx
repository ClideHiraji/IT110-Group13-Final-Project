// resources/js/Components/Timeline/MinimalProgress.jsx

import React from 'react';
import { motion } from 'framer-motion';

export default function MinimalProgress({ periods, currentPeriod }) {
  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {periods.map((period, index) => (
        <motion.div
          key={period.id}
          className="relative group"
          animate={{
            scale: currentPeriod === index ? 1.5 : 1,
            opacity: currentPeriod === index ? 1 : 0.3
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Main Dot */}
          <div
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: currentPeriod === index ? period.color : '#ffffff40',
              boxShadow: currentPeriod === index ? `0 0 20px ${period.color}` : 'none'
            }}
          />
          
          {/* Pulse Effect for Active */}
          {currentPeriod === index && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ borderColor: period.color, borderWidth: '2px' }}
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
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
          <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded px-3 py-1.5 shadow-lg">
              <div className="text-left">
                <p className="text-white text-xs font-semibold">{period.title}</p>
                <p className="text-gray-400 text-[10px]">{period.period}</p>
              </div>
            </div>
            
            {/* Arrow pointing to dot */}
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