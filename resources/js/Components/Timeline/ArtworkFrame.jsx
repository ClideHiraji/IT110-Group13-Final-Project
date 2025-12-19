import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * ArtworkFrame Component
 * 
 * Displays artwork in ornate gold museum-style frame with 3D hover effects.
 * Handles image validation, error states, and interactive hover animations.
 * 
 * @param {Object} artwork - Artwork data object
 * @param {Object} period - Period object with color theme
 * @param {Function} onClick - Click handler
 * @param {Function} onHoverStart - Hover start callback
 * @param {Function} onHoverEnd - Hover end callback
 * @param {boolean} isFront - Whether frame is in front position
 */
export default function ArtworkFrame({ artwork, period, onClick, onHoverStart, onHoverEnd, isFront }) {
    // Critical null/undefined check to prevent rendering errors
    // Returns null early if artwork data is missing
    if (!artwork) {
        console.error('ArtworkFrame: artwork is null/undefined');
        return null;
    }

    // State to track if mouse is hovering over the frame
    const [isHovered, setIsHovered] = useState(false);
    
    // State to track if image failed to load
    const [imageError, setImageError] = useState(false);

    // Handler for mouse entering the frame area
    // Sets hover state and calls parent callback if provided
    const handleMouseEnter = () => {
        setIsHovered(true);
        if (onHoverStart) onHoverStart();
    };

    // Handler for mouse leaving the frame area
    // Clears hover state and calls parent callback if provided
    const handleMouseLeave = () => {
        setIsHovered(false);
        if (onHoverEnd) onHoverEnd();
    };

    // Handler for clicking the frame
    // Stops event propagation and calls parent click handler
    const handleClick = (e) => {
        e.stopPropagation();
        if (onClick) onClick(e);
    };

    // Validate image URL to ensure it's a proper HTTP URL
    // Checks for null, undefined, empty strings, and proper HTTP protocol
    const hasValidImage = artwork?.image &&
        artwork.image !== 'undefined' &&
        artwork.image !== 'null' &&
        typeof artwork.image === 'string' &&
        artwork.image.trim().length > 0 &&
        artwork.image.startsWith('http');

    return (
        <motion.div
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative w-64 h-80 cursor-pointer"
            // Slightly enlarges frame on hover
            whileHover={{ scale: 1.05 }}
            // Enables 3D transform effects
            style={{ 
                transformStyle: 'preserve-3d',
                boxShadow: isHovered && period 
                    ? `0 0 36px ${period.color}99, 0 0 72px ${period.color}55`
                    : undefined,
                transition: 'box-shadow .2s ease'
            }}
        >
            {/* Ornate Gold Frame Border */}
            <div 
                className="absolute inset-0 rounded-lg border-8 border-yellow-600/80 shadow-2xl"
                style={{
                    background: 'linear-gradient(135deg, #b8860b, #daa520, #b8860b)',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.5)',
                }}
            />

            {/* Inner Shadow for Depth */}
            <div className="absolute inset-2 bg-black/20 rounded" />

            {/* Artwork Container */}
            <div className="absolute inset-4 bg-gray-900 rounded overflow-hidden">
                {hasValidImage && !imageError ? (
                    // Display the artwork image if valid and no error
                    <img
                        src={artwork.image}
                        alt={artwork.title || 'Artwork'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        // Handle image load errors by setting error state
                        onError={() => {
                            console.warn(`Image failed to load: ${artwork.title || 'Unknown'}`);
                            setImageError(true);
                        }}
                    />
                ) : (
                    // Fallback display when image is invalid or failed to load
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-4">
                        <p className="text-gray-400 text-sm text-center font-serif">
                            {artwork.title || 'Untitled'}
                        </p>
                    </div>
                )}

                {/* Hover Overlay with proper z-index and 3D transform */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-4"
                    // Fade in/out animation on hover
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    // Ensures overlay appears above image with 3D positioning
                    style={{ 
                        zIndex: 10,
                        transform: 'translateZ(20px)'
                    }}
                >
                    {/* Artwork title */}
                    <h3 className="text-white font-serif text-lg font-bold mb-1 line-clamp-2">
                        {artwork.title || 'Untitled'}
                    </h3>

                    {/* Artist name */}
                    <p className="text-gray-300 text-sm mb-1">
                        {artwork.artist || 'Unknown Artist'}
                    </p>

                    {/* Year created */}
                    <p className="text-gray-400 text-xs">
                        {artwork.year || 'Date Unknown'}
                    </p>
                </motion.div>

                {/* Spotlight Effect */}
                {isHovered && period && (
                    // Radial glow effect colored by period theme
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.80 }}
                        style={{
                            background: `radial-gradient(circle at 50% 50%, ${period.color}80, transparent 65%)`,
                        }}
                    />
                )}
            </div>

            {/* Frame Corner Decorations */}
            {/* Decorative elements in each corner of the frame */}
            {[
                { top: '0.5rem', left: '0.5rem' },
                { top: '0.5rem', right: '0.5rem' },
                { bottom: '0.5rem', left: '0.5rem' },
                { bottom: '0.5rem', right: '0.5rem' },
            ].map((position, index) => (
                <div
                    key={index}
                    className="absolute w-3 h-3 border-2 border-yellow-400/60"
                    style={position}
                />
            ))}

            {/* Glow Effect Behind Frame */}
            {period && (
                <motion.div
                    className="absolute -inset-8 rounded-xl blur-3xl opacity-0 pointer-events-none"
                    animate={{
                        opacity: isFront ? (isHovered ? 1 : 0.75 ) : (isHovered ? 0.6 : 0.35),
                        scale: isFront ? 1.12 : 1
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                        background: `radial-gradient(circle, ${period.color}CC, transparent 66%)`,
                        boxShadow: isHovered 
                            ? `0 0 40px ${period.color}AA, 0 0 80px ${period.color}55` 
                            : `0 0 24px ${period.color}66, 0 0 48px ${period.color}33`,
                        transition: 'box-shadow .2s ease'
                    }}
                />
            )}
        </motion.div>
    );
}
