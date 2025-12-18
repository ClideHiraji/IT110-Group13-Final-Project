// resources/js/Components/Timeline/Carousel3D.jsx

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ArtworkFrame from './ArtworkFrame';

export default function Carousel3D({ artworks, period, onArtworkClick, isActive }) {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);
  const containerRef = useRef(null);
  const [isHoveringArtwork, setIsHoveringArtwork] = useState(false);

  const displayArtworks = artworks;
  const radius = displayArtworks.length === 4 ? 360 : 300;
  const angleStep = 360 / displayArtworks.length;

  // Auto-rotation when not dragging, active, and NOT hovering
  useEffect(() => {
    if (!isActive || isDragging || isHoveringArtwork) return;
    
    const interval = setInterval(() => {
      setRotation(prev => prev + 0.15);
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, isDragging, isHoveringArtwork]);

  // Mouse drag handlers - disabled when hovering artwork
  const handleMouseDown = (e) => {
    // Don't start dragging if hovering over an artwork
    if (isHoveringArtwork) return;

    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentRotation(rotation);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isHoveringArtwork) return;
    const deltaX = e.clientX - startX;
    setRotation(currentRotation + deltaX * 0.5);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (isHoveringArtwork) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentRotation(rotation);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isHoveringArtwork) return;
    const deltaX = e.touches[0].clientX - startX;
    setRotation(currentRotation + deltaX * 0.5);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startX, currentRotation, isHoveringArtwork]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
      style={{ perspective: '2000px' }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="relative w-full h-full"
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transform: `rotateY(${rotation}deg)`,
          transition: isDragging ? 'none' : 'transform 0.1s linear',
          cursor: isHoveringArtwork ? 'default' : isDragging ? 'grabbing' : 'grab',
        }}
      >
        {displayArtworks.map((artwork, index) => {
          const angle = index * angleStep;
          const radian = (angle * Math.PI) / 180;
          const x = Math.sin(radian) * radius;
          const z = Math.cos(radian) * radius;

          // Determine if this artwork is in the front (brightest/largest)
          const isFront = Math.abs(z - radius) < 120;
          
          return (
            <div
              key={artwork.id}
              className="absolute top-1/2 left-1/2"
              style={{
                transform: `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px) rotateY(${-angle}deg)`,
                transformStyle: 'preserve-3d',
                // CHANGED: ALL artworks are now clickable
                pointerEvents: 'auto',
                zIndex: isFront ? 10 : 1,
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: 1, 
                  scale: isFront ? 1.15 : 0.9 
                }}
                transition={{ 
                  delay: index * 0.2,
                  duration: 0.4,
                  ease: "easeOut"
                }}
              >
                <ArtworkFrame
                  artwork={artwork}
                  period={period}
                  onClick={(e) => {
                    // Stop event from bubbling to carousel
                    e.stopPropagation();
                    // CHANGED: Allow clicks on ALL artworks
                    onArtworkClick(artwork, period.id);
                  }}
                  onHoverStart={() => setIsHoveringArtwork(true)}
                  onHoverEnd={() => setIsHoveringArtwork(false)}
                  isFront={isFront}
                />
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Instructions Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center z-50 pointer-events-none"
      >
        <p className="text-white/60 text-sm mb-2">
          <span className="hidden md:inline">Drag to rotate • </span>
          Hover to pause • Click any artwork to explore
        </p>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto"
        />
      </motion.div>
    </div>
  );
}