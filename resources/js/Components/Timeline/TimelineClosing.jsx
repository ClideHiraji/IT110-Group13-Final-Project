import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';

/**
 * TimelineClosing Component
 * 
 * Final section of the immersive timeline experience.
 * Provides a reflective closing message and two main actions:
 * - Explore the user's personal collection (or redirect to login)
 * - Scroll back to the beginning of the timeline
 * 
 * Includes:
 * - Animated background and floating particles
 * - Decorative icon with continuous motion
 * - Animated heading, body text, and call-to-action buttons
 */
export default function TimelineClosing() {
  // Access shared auth props from Inertia page context
  const { auth } = usePage().props;

  /**
   * Handle "Explore Your Collection" button click.
   * 
   * If user is authenticated:
   *   - Navigate directly to /collection
   * If not authenticated:
   *   - Navigate to /login and pass current URL as return_url
   *     so user can be redirected back after logging in
   */
  const handleExploreCollection = () => {
    if (auth?.user) {
      router.visit('/collection');
    } else {
      router.visit('/login?return_url=' + encodeURIComponent(window.location.href));
    }
  };

  /**
   * Handle "Return to Beginning" button click.
   * 
   * Smoothly scrolls the window back to the top of the page,
   * effectively returning to the start of the timeline.
   */
  const handleReturnToBeginning = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Ambient Background */}
      {/* Gradient backdrop adding depth and subtle color tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black" />
      
      {/* Floating Particles */}
      {/* Ambient small animated dots to give the scene a dynamic, atmospheric feel */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/30 rounded-full"
            style={{
              // Randomize initial position of each particle
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              // Vertical floating motion
              y: [0, -30, 0],
              // Subtle opacity pulsing
              opacity: [0.2, 0.6, 0.2],
              // Slight scale pulsing
              scale: [1, 1.5, 1],
            }}
            transition={{
              // Vary duration per particle for a more organic feel
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Content Container */}
      {/* Main centered content block with entrance animation */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
      >
        {/* Decorative Icon */}
        {/* Circular rotating frame with central Sparkles icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.3, type: "spring" }}
          viewport={{ once: true }}
          className="inline-block mb-8"
        >
          <div className="relative">
            {/* Outer rotating ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-2 border-amber-500/30 rounded-full"
            />
            {/* Inner pulsing Sparkles icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sparkles className="text-amber-400" size={32} />
            </motion.div>
          </div>
        </motion.div>

        {/* Main Title */}
        {/* Gradient text heading introducing the closing section */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-bold mb-8"
        >
          <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-purple-300 bg-clip-text text-transparent">
            The Canvas Continues
          </span>
        </motion.h2>

        {/* Divider Line */}
        {/* Animated horizontal line beneath the heading */}
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          transition={{ duration: 1.5, delay: 0.7 }}
          viewport={{ once: true }}
          className="h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mb-8 max-w-2xl mx-auto"
        />

        {/* Body Text */}
        {/* First descriptive paragraph about the journey through art */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          viewport={{ once: true }}
          className="text-gray-300 text-xl md:text-2xl leading-relaxed mb-6 max-w-3xl mx-auto"
        >
          Every artwork you've encountered is a doorway—to other worlds, other voices, other ways of seeing. 
          The story of human creativity doesn't end here. It unfolds in galleries yet to be visited, 
          in artists yet to be discovered, in the quiet moments when a single image speaks to your soul.
        </motion.p>

        {/* Second descriptive paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          viewport={{ once: true }}
          className="text-gray-400 text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto"
        >
          Art is not a timeline—it is a conversation across centuries. Your journey through it has no final chapter, 
          only new invitations to look closer, feel deeper, and wonder longer.
        </motion.p>

        {/* Closing Line */}
        {/* Highlighted closing question to invite further exploration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="text-amber-300 text-2xl md:text-3xl font-light italic">
            What will you discover next?
          </p>
        </motion.div>

        {/* Decorative Bottom Line */}
        {/* Subtle line reinforcement near the bottom of the content block */}
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          transition={{ duration: 1.5, delay: 1.5 }}
          viewport={{ once: true }}
          className="h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent max-w-xl mx-auto mb-12"
        />

        {/* Call to Action Buttons */}
        {/* Primary and secondary actions encouraging further engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.7 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-4 justify-center"
        >
          {/* Primary CTA: Explore collection or redirect to login */}
          <motion.button
            onClick={handleExploreCollection}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-amber-500/50 transition-all"
          >
            <span>Explore Your Collection</span>
            <ArrowRight size={20} />
          </motion.button>

          {/* Secondary CTA: Smooth scroll back to the beginning */}
          <motion.button
            onClick={handleReturnToBeginning}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 textwhite font-semibold rounded-lg border border-white/30 backdrop-blur-sm transition-all"
          >
            <span>Return to Beginning</span>
          </motion.button>
        </motion.div>

        {/* Subtle Footer Text */}
        {/* Final small text summarizing the theme of endless discovery */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          viewport={{ once: true }}
          className="text-gray-600 text-sm mt-16"
        >
          The journey through art is infinite. Every ending is a new beginning.
        </motion.p>
      </motion.div>

      {/* Ambient Glow Effects */}
      {/* Large blurred color glows in corners to reinforce atmosphere */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
    </section>
  );
}
