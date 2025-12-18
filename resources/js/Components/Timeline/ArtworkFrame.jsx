// resources/js/Components/Timeline/ArtworkFrame.jsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ArtworkFrame({ artwork, period, onClick, onHoverStart, onHoverEnd, isFront }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    // CHANGED: Allow hover on ALL artworks, not just front
    setIsHovered(true);
    onHoverStart?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHoverEnd?.();
  };

  const handleClick = (e) => {
    // Prevent event from bubbling to carousel
    e.stopPropagation();
    // CHANGED: Allow clicks on ALL artworks
    onClick(e);
  };

  return (
    <motion.div
      data-artwork 
      className="relative group cursor-pointer"
      style={{ 
        width: '220px', 
        height: '300px',
        // CHANGED: All artworks are clickable now
        pointerEvents: 'auto',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      whileHover={{ scale: 1.1, z: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Ornate Gold Frame Border */}
      <div className="absolute inset-0 p-4 bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700 rounded-lg shadow-2xl">
        
        {/* Inner Shadow for Depth */}
        <div className="absolute inset-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] rounded" />
        
        {/* Artwork Container */}
        <div className="relative w-full h-full bg-black rounded overflow-hidden">
          {artwork.image ? (
            <motion.img
              src={artwork.image}
              alt={artwork.title}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.6 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <p className="text-white/30 text-sm text-center px-4">{artwork.title}</p>
            </div>
          )}

          {/* Hover Overlay with Info - CHANGED: Shows on all artworks */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end p-6"
          >
            <motion.h3 
              initial={{ y: 20 }}
              animate={{ y: isHovered ? 0 : 20 }}
              transition={{ duration: 0.3 }}
              className="text-white font-bold text-lg mb-2 line-clamp-2"
            >
              {artwork.title}
            </motion.h3>
            
            <motion.p 
              initial={{ y: 20 }}
              animate={{ y: isHovered ? 0 : 20 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="text-amber-300 text-sm mb-1"
            >
              {artwork.artist}
            </motion.p>
            
            <motion.p 
              initial={{ y: 20 }}
              animate={{ y: isHovered ? 0 : 20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-white/60 text-xs"
            >
              {artwork.year}
            </motion.p>
          </motion.div>

          {/* Spotlight Effect */}
          {isHovered && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, transparent 30%, ${period.color}20 100%)`
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>

        {/* Frame Corner Decorations */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-900/50 rounded-tl" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-900/50 rounded-tr" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-900/50 rounded-bl" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-900/50 rounded-br" />
      </div>

      {/* Glow Effect Behind Frame */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-lg blur-xl"
        style={{ backgroundColor: period.color }}
        animate={{ 
          opacity: isHovered ? 0.6 : 0.2,
          scale: isHovered ? 1.2 : 1
        }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
}