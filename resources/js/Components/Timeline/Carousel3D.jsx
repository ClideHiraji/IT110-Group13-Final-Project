import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ArtworkFrame from './ArtworkFrame';

/**
 * Carousel3D Component
 * 
 * Interactive 3D rotating carousel that displays artworks in a circular arrangement.
 * Features drag-to-rotate, auto-rotation, pause-on-hover, and touch support.
 * 
 * @param {Array} artworks - Array of artwork objects to display in the carousel
 * @param {Object} period - Period object containing color and metadata for styling
 * @param {Function} onArtworkClick - Callback function when an artwork is clicked
 * @param {boolean} isActive - Whether this carousel is currently in the active viewport
 * @param {Array} savedArtworks - Array of saved artwork IDs for comparison
 * @param {Function} onSaveArtwork - Callback function to save an artwork
 * @param {Function} onRemoveArtwork - Callback function to remove a saved artwork
 */
export default function Carousel3D({ 
  artworks, 
  period, 
  onArtworkClick, 
  isActive,
  savedArtworks = [],
  onSaveArtwork,
  onRemoveArtwork
}) {
  // State: Current rotation angle of the carousel in degrees
  const [rotation, setRotation] = useState(0);
  
  // State: Whether the user is currently dragging the carousel
  const [isDragging, setIsDragging] = useState(false);
  
  // State: X coordinate where the drag operation started
  const [startX, setStartX] = useState(0);
  
  // State: Rotation value when the drag operation started
  const [currentRotation, setCurrentRotation] = useState(0);
  
  // Ref: Reference to the carousel container DOM element
  const containerRef = useRef(null);
  
  // State: Whether the mouse is currently hovering over an artwork
  const [isHoveringArtwork, setIsHoveringArtwork] = useState(false);


  // Filter out null/undefined artworks and hard-limit to 4 cards
  // Only display valid artworks that have an id property
  // Limit to maximum of 4 artworks for optimal carousel spacing
  const displayArtworks = (artworks || [])
    .filter(artwork => artwork && artwork.id)
    .slice(0, 4);
  
  // Don't render if no artworks
  // Early return with message if no valid artworks are available
  if (displayArtworks.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-white/50">No artworks available</p>
      </div>
    );
  }

  // Calculate carousel radius based on number of artworks
  // 4 artworks get larger radius (360px) for better spacing
  // Fewer artworks use smaller radius (300px)
  const radius = displayArtworks.length === 4 ? 360 : 300;
  
  // Calculate angle step between each artwork position
  const angleStep = 360 / (displayArtworks.length || 1);
  
  // Deterministic positions for 4 cards to ensure clear spacing
  // For 4 artworks, use fixed positions at cardinal directions (0°, 90°, 180°, 270°)
  // For other counts, calculate positions evenly around the circle
  const anglePositions =
    displayArtworks.length === 4
      ? [0, 90, 180, 270]
      : displayArtworks.map((_, idx) => idx * angleStep);


  // Auto-rotation when not dragging, active, and NOT hovering
  // Effect: Continuously rotates carousel when conditions are met
  // Pauses rotation when user is dragging or hovering over an artwork
  useEffect(() => {
    // Don't auto-rotate if carousel is inactive, being dragged, or artwork is being hovered
    if (!isActive || isDragging || isHoveringArtwork) return;
    
    // Rotate carousel by -0.2 degrees every 50ms (clockwise rotation)
    const interval = setInterval(() => {
      setRotation(prev => prev - 0.2);
    }, 50);

    // Cleanup: Clear interval when component unmounts or dependencies change
    return () => clearInterval(interval);
  }, [isActive, isDragging, isHoveringArtwork]);


  // Mouse drag handlers - disabled when hovering artwork
  // Handler: Initiates drag operation when mouse button is pressed
  const handleMouseDown = (e) => {
    // Don't start dragging if user is hovering over an artwork
    if (isHoveringArtwork) return;

    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentRotation(rotation);
  };

  // Handler: Updates rotation based on mouse movement during drag
  const handleMouseMove = (e) => {
    // Only process if currently dragging and not hovering artwork
    if (!isDragging || isHoveringArtwork) return;
    
    // Calculate horizontal distance moved since drag started
    const deltaX = e.clientX - startX;
    
    // Update rotation: 0.5 degrees per pixel moved
    setRotation(currentRotation + deltaX * 0.5);
  };

  // Handler: Ends drag operation when mouse button is released
  const handleMouseUp = () => {
    setIsDragging(false);
  };


  // Touch handlers for mobile
  // Handler: Initiates drag operation for touch devices
  const handleTouchStart = (e) => {
    // Don't start dragging if user is hovering over an artwork
    if (isHoveringArtwork) return;
    
    setIsDragging(true);
    // Get X coordinate from first touch point
    setStartX(e.touches[0].clientX);
    setCurrentRotation(rotation);
  };

  // Handler: Updates rotation based on touch movement
  const handleTouchMove = (e) => {
    // Only process if currently dragging and not hovering artwork
    if (!isDragging || isHoveringArtwork) return;
    
    // Calculate horizontal distance moved since touch started
    const deltaX = e.touches[0].clientX - startX;
    
    // Update rotation: 0.5 degrees per pixel moved
    setRotation(currentRotation + deltaX * 0.5);
  };

  // Handler: Ends drag operation when touch is released
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Effect: Attach global mouse event listeners during drag operation
  // Allows drag to continue even if mouse leaves the carousel container
  useEffect(() => {
    if (isDragging) {
      // Add listeners to window for global mouse tracking
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      // Cleanup: Remove listeners when drag ends or component unmounts
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
      // Set 3D perspective for proper depth rendering
      style={{ perspective: '2000px' }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Carousel container with 3D transforms */}
      <div 
        className="relative w-full h-full"
        style={{
          width: '100%',
          height: '100%',
          // Enable 3D transforms for child elements
          transformStyle: 'preserve-3d',
          // Apply rotation around Y-axis for carousel effect
          transform: `rotateY(${rotation}deg)`,
          // Smooth transition when not dragging, instant update while dragging
          transition: isDragging ? 'none' : 'transform 0.1s linear',
          // Dynamic cursor based on interaction state
          cursor: isHoveringArtwork ? 'default' : isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Render each artwork in 3D circular arrangement */}
        {displayArtworks.map((artwork, index) => {
          // Extra safety check
          // Skip rendering if artwork is invalid or missing id
          if (!artwork || !artwork.id) {
            console.warn('Invalid artwork at index', index);
            return null;
          }

          // Get predetermined angle for this artwork position
          const angle = anglePositions[index] ?? (index * angleStep);
          
          // Convert angle to radians for trigonometric calculations
          const radian = (angle * Math.PI) / 180;
          
          // Calculate 3D position using circular trigonometry
          // X: Horizontal position (sine of angle × radius)
          const x = Math.sin(radian) * radius;
          
          // Z: Depth position (cosine of angle × radius)
          const z = Math.cos(radian) * radius;

          // Determine if this artwork is currently facing the viewer
          // Front artworks are within 120 units of maximum Z position
          const isFront = Math.abs(z - radius) < 120;
          
          // Check if this artwork is saved by comparing IDs
          const isSaved = savedArtworks.includes(artwork.id?.toString());
          
          return (
            <div
              key={artwork.id || index}
              className="absolute top-1/2 left-1/2"
              style={{
                // Position artwork in 3D space:
                // 1. Center at container origin
                // 2. Move to calculated circular position
                // 3. Rotate to face center of carousel
                transform: `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px) rotateY(${-angle}deg)`,
                transformStyle: 'preserve-3d',
                pointerEvents: 'auto',
                // Front artworks render on top
                zIndex: isFront ? 10 : 1,
              }}
            >
              {/* Animated wrapper for entrance effects */}
              <motion.div
                // Initial state: invisible and small
                initial={{ opacity: 0, scale: 0.5 }}
                // Animated state: visible with size based on position
                animate={{ 
                  opacity: 1, 
                  // Front artworks are larger (1.15x) than back ones (0.9x)
                  scale: isFront ? 1.15 : 0.9 
                }}
                // Stagger entrance: each artwork appears 0.2s after previous
                transition={{ 
                  delay: index * 0.2,
                  duration: 0.4,
                  ease: "easeOut"
                }}
                className="relative group"
              >
                <ArtworkFrame
                  artwork={artwork}
                  period={period}
                  // Click handler: Stop event propagation and trigger parent callback
                  onClick={(e) => {
                    e.stopPropagation();
                    onArtworkClick(artwork, period.id);
                  }}
                  // Hover handlers: Update hover state to pause rotation
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
      {/* Animated instruction text at bottom of carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center z-50 pointer-events-none"
      >
        {/* Instruction text with responsive visibility */}
        <p className="text-white/60 text-sm mb-2">
          {/* "Drag to rotate" only shows on desktop */}
          <span className="hidden md:inline">Drag to rotate • </span>
          Hover to pause • Click any artwork to explore
        </p>
        {/* Pulsing decorative line indicator */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto"
        />
      </motion.div>
    </div>
  );
}
