// resources/js/Components/Timeline/ArtworkModal.jsx

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, MapPin, Palette, ExternalLink, Sparkles, Heart } from 'lucide-react';

export default function ArtworkModal({ 
  artwork, 
  onClose, 
  periodColor = '#f59e0b',
  isAuthenticated = false,
  onSave = null,
  isSaved = false
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [localSaved, setLocalSaved] = useState(isSaved);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleSave = () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    
    setLocalSaved(!localSaved);
    
    if (onSave) {
      onSave(artwork, !localSaved);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8"
      >
        <motion.div
          initial={{ scale: 0.8, rotateY: -90 }}
          animate={{ scale: 1, rotateY: 0 }}
          exit={{ scale: 0.8, rotateY: 90 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-4xl w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden border shadow-2xl"
          style={{ borderColor: periodColor }}
        >
          {/* Close Button */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all"
          >
            <X size={24} />
          </motion.button>

          {/* Decorative Glow Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-amber-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-3xl" />

          {/* Consistent height for all modals */}
          <div className="grid md:grid-cols-2 gap-0 h-[85vh] max-h-[700px] min-h-0">
            {/* Image Section */}
            <div className="relative h-full overflow-hidden bg-black">
              {artwork.image ? (
                <>
                  <motion.img
                    src={artwork.image}
                    alt={artwork.title}
                    className="w-full h-full object-contain"
                    initial={{ scale: 1.2, filter: "blur(20px)", opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      filter: "blur(0px)", 
                      opacity: 1 
                    }}
                    transition={{ duration: 0.8 }}
                    onLoad={() => setImageLoaded(true)}
                  />
                  
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-500 text-lg">No image available</p>
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              
              <motion.div
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-4 left-4"
              >
                <Sparkles size={24} className="text-amber-400" />
              </motion.div>
            </div>
            
            {/* Details Section with FIXED scrolling layout */}
            <div className="p-6 md:p-8 flex flex-col h-full min-h-0">
              {/* Scrollable Content Area - takes available space */}
              <div className="flex-1 overflow-y-auto pr-2 pb-32 min-h-0 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {/* Title */}
                <motion.h2
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight"
                >
                  {artwork.title}
                </motion.h2>

                {/* Artist */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <div className="p-2 bg-amber-500/20 rounded-full">
                    <User size={20} className="text-amber-400" />
                  </div>
                  <span className="text-lg md:text-xl text-amber-300 font-medium">
                    {artwork.artist}
                  </span>
                </motion.div>
                
                {/* Metadata Grid */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-1 gap-3 mb-6"
                >
                  {artwork.year && (
                    <div className="flex items-center gap-3 text-gray-300 bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                      <Calendar size={18} className="text-blue-400 flex-shrink-0" />
                      <span className="text-sm">{artwork.year}</span>
                    </div>
                  )}
                  
                  {artwork.location && (
                    <div className="flex items-center gap-3 text-gray-300 bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                      <MapPin size={18} className="text-green-400 flex-shrink-0" />
                      <span className="text-sm">{artwork.location}</span>
                    </div>
                  )}
                  
                  {artwork.medium && (
                    <div className="flex items-center gap-3 text-gray-300 bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                      <Palette size={18} className="text-purple-400 flex-shrink-0" />
                      <span className="text-sm">{artwork.medium}</span>
                    </div>
                  )}
                </motion.div>

                {/* Description - no clamp, let it flow naturally */}
                {artwork.description && (
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="border-t border-gray-700 pt-4 mb-6"
                  >
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {artwork.description}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons - ALWAYS VISIBLE, never scrolls away */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-3 pt-4 mt-4 border-t border-gray-700/50 flex-shrink-0"
              >
                {/* Save Button */}
                <motion.button
                  onClick={handleSave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 font-semibold rounded-lg transition-all shadow-lg text-sm ${
                    localSaved 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  <Heart 
                    size={16} 
                    className={localSaved ? 'fill-current' : ''} 
                  />
                  <span>{localSaved ? 'Saved' : 'Save'}</span>
                </motion.button>

                {/* Met Museum Link */}
                {artwork.objectURL && (
                  <motion.a
                    href={artwork.objectURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all text-sm"
                  >
                    <span>View Original</span>
                    <ExternalLink size={16} />
                  </motion.a>
                )}

                {/* Public Domain Badge - inline with buttons */}
                {artwork.isPublicDomain && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                    className="inline-flex items-center px-3 py-2 bg-green-500/20 text-green-400 text-xs font-semibold rounded-lg border border-green-500/30"
                  >
                    <Sparkles size={14} className="mr-2" />
                    Public Domain
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}