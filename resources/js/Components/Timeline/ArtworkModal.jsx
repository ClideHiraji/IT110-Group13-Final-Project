import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, MapPin, Palette, ExternalLink, Sparkles, Heart } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';

/**
 * ArtworkModal Component
 * 
 * Full-screen modal displaying detailed artwork information.
 * Handles save/remove functionality with authentication checks.
 * 
 * @param {Object} artwork - Full artwork data object
 * @param {Function} onClose - Close modal callback
 * @param {string} periodColor - Period theme color for styling
 * @param {boolean} isSaved - Whether artwork is saved to collection
 * @param {Function} onSave - Save artwork callback
 * @param {Function} onRemove - Remove artwork callback
 * @param {Function} onPrev - Navigate to previous artwork
 * @param {Function} onNext - Navigate to next artwork
 */
export default function ArtworkModal({
    artwork,
    onClose,
    periodColor = '#f59e0b',
    isSaved = false,
    onSave,
    onRemove,
    onPrev,
    onNext
}) {
    // Get authentication state from Inertia props
    const { auth } = usePage().props;
    
    // Track if image has finished loading
    const [imageLoaded, setImageLoaded] = useState(false);
    
    // Track if image failed to load
    const [imageError, setImageError] = useState(false);
    
    // Track if save/remove operation is in progress
    const [saving, setSaving] = useState(false);

    // Validate image URL using same checks as ArtworkFrame
    const hasValidImage = artwork?.image &&
        artwork.image !== 'undefined' &&
        artwork.image !== 'null' &&
        typeof artwork.image === 'string' &&
        artwork.image.trim().length > 0 &&
        artwork.image.startsWith('http');

    // Setup keyboard listener for ESC key and prevent body scroll
    useEffect(() => {
        // Close modal when ESC key is pressed
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };

        // Prevent background scrolling while modal is open
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEsc);

        // Cleanup: restore scrolling and remove event listener
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    // Save handler with Inertia router
    // Handles authentication check and save/remove toggle
    const handleSave = async () => {
        // If user not authenticated, store artwork and redirect to login
        if (!auth?.user) {
            localStorage.setItem('pending_artwork_save', JSON.stringify(artwork));
            router.visit('/login?return_url=' + encodeURIComponent(window.location.href));
            return;
        }

        // Prevent duplicate save operations
        if (saving) return;

        setSaving(true);

        try {
            // Toggle between save and remove based on current state
            if (isSaved) {
                await onRemove(artwork.id);
            } else {
                await onSave(artwork);
            }
        } catch (error) {
            console.error('Error toggling save:', error);
        } finally {
            // Reset saving state
            setSaving(false);
        }
    };

    return (
        <>
            {/* Modal Backdrop - Click to close */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
                {/* Modal Container - Stop propagation to prevent closing */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative max-w-5xl w-full bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl"
                    style={{
                        borderWidth: '2px',
                        borderColor: periodColor,
                        boxShadow: `0 25px 50px -12px ${periodColor}30, 0 0 0 1px ${periodColor}20`
                    }}
                >
                    {/* Animated Border Glow */}
                    {/* Pulsing glow effect around modal border */}
                    <motion.div
                        className="absolute inset-0 rounded-3xl pointer-events-none"
                        animate={{
                            boxShadow: [
                                `0 0 20px ${periodColor}40`,
                                `0 0 40px ${periodColor}60`,
                                `0 0 20px ${periodColor}40`,
                            ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />

                    {/* Close Button with Enhanced Style */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-20 p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all duration-300 group"
                        style={{
                            boxShadow: `0 0 20px ${periodColor}30`
                        }}
                    >
                        <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
                    </button>

                    {/* Decorative Glow Elements - Enhanced */}
                    {/* Top left decorative glow */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
                        style={{ background: `radial-gradient(circle, ${periodColor}, transparent)` }}
                    />
                    {/* Bottom right decorative glow */}
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
                        style={{ background: `radial-gradient(circle, ${periodColor}, transparent)` }}
                    />

                    {/* Main Content Grid */}
                    <div className="grid md:grid-cols-2 gap-0 relative">
                        {/* Image Section - Enhanced */}
                        <div className="relative h-96 md:h-auto min-h-[400px] overflow-hidden">
                            {hasValidImage && !imageError ? (
                                <>
                                    {/* Main artwork image */}
                                    <img
                                        src={artwork.image}
                                        alt={artwork.title}
                                        className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                        onLoad={() => setImageLoaded(true)}
                                        onError={() => {
                                            console.warn(`Modal image failed: ${artwork.title}`);
                                            setImageError(true);
                                        }}
                                    />

                                    {/* Loading skeleton displayed while image loads */}
                                    {!imageLoaded && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse flex items-center justify-center">
                                            <div className="w-16 h-16 border-4 border-gray-600 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </>
                            ) : (
                                // Fallback when image is invalid or failed
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                    <p className="text-gray-500 text-lg">No image available</p>
                                </div>
                            )}

                            {/* Enhanced Gradient Overlays */}
                            {/* Bottom to top gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
                            {/* Left to right gradient overlay (desktop only) */}
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 via-transparent to-transparent md:opacity-100 opacity-0" />

                            {/* Floating Sparkle Icon */}
                            {/* Rotating sparkle icon in top left */}
                            <motion.div
                                className="absolute top-6 left-6"
                                animate={{
                                    rotate: [0, 360],
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                <Sparkles className="w-8 h-8 text-white/80" style={{ filter: `drop-shadow(0 0 8px ${periodColor})` }} />
                            </motion.div>
                        </div>

                        {/* Details Section - Enhanced */}
                        <div className="p-8 md:p-10 flex flex-col relative">
                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                {/* Title with Enhanced Animation */}
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-4xl font-bold text-white leading-tight font-serif"
                                    style={{
                                        textShadow: `0 0 20px ${periodColor}40`
                                    }}
                                >
                                    {artwork.title}
                                </motion.h2>

                                {/* Artist with Enhanced Card */}
                                {artwork.artist && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-800/60 to-transparent backdrop-blur-sm border border-gray-700/50"
                                    >
                                        <User className="w-5 h-5 flex-shrink-0" style={{ color: periodColor }} />
                                        <span className="text-gray-200 text-lg font-medium">{artwork.artist}</span>
                                    </motion.div>
                                )}

                                {/* Metadata Grid - Enhanced Cards */}
                                <div className="grid grid-cols-1 gap-3">
                                    {/* Year */}
                                    {artwork.year && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/40 backdrop-blur-sm border border-gray-700/30"
                                        >
                                            <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: periodColor }} />
                                            <span className="text-gray-300 text-sm">{artwork.year}</span>
                                        </motion.div>
                                    )}

                                    {/* Location */}
                                    {artwork.location && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.25 }}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/40 backdrop-blur-sm border border-gray-700/30"
                                        >
                                            <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: periodColor }} />
                                            <span className="text-gray-300 text-sm">{artwork.location}</span>
                                        </motion.div>
                                    )}

                                    {/* Medium */}
                                    {artwork.medium && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/40 backdrop-blur-sm border border-gray-700/30"
                                        >
                                            <Palette className="w-4 h-4 flex-shrink-0" style={{ color: periodColor }} />
                                            <span className="text-gray-300 text-sm">{artwork.medium}</span>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Description - Enhanced */}
                                {artwork.description && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                        className="p-4 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30"
                                    >
                                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                            {artwork.description}
                                        </p>
                                    </motion.div>
                                )}
                            </div>

                            {/* Action Buttons - Enhanced */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-6 flex flex-wrap gap-3"
                            >
                                {/* Save Button - Enhanced */}
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        background: isSaved
                                            ? `linear-gradient(135deg, ${periodColor}90, ${periodColor})`
                                            : `linear-gradient(135deg, ${periodColor}60, ${periodColor}90)`,
                                        boxShadow: `0 4px 20px ${periodColor}40`,
                                    }}
                                >
                                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                                    {saving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                                </button>

                                {/* Met Museum Link - Enhanced */}
                                {artwork.objectURL && (
                                    <a
                                        href={artwork.objectURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 border border-gray-700"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                        View Original
                                    </a>
                                )}

                                {/* Public Domain Badge - Enhanced */}
                                {artwork.isPublicDomain && (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-900/30 border border-green-700/50">
                                        <span className="text-green-400 text-sm font-medium">Public Domain</span>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
}
