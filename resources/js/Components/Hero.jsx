import React from "react";
import { motion } from "framer-motion";

/**
 * Hero Component
 * 
 * Landing page hero section with typewriter animation.
 * Introduces the art timeline journey with engaging animation.
 * 
 * Features:
 * - Typewriter text animation
 * - Staggered letter animations
 * - Call-to-action button
 * - Parallax scroll effects
 * - Cinematic presentation
 * 
 * Animations:
 * - Title appears letter-by-letter
 * - Subtitle fades in after title
 * - Button slides up
 * - Scroll-based parallax
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onBegin - Callback when user clicks begin button
 * 
 * @example
 * // In landing page
 * const handleBegin = () => {
 *   // Scroll to timeline or navigate
 *   window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
 * };
 * 
 * <Hero onBegin={handleBegin} />
 * 
 * @example
 * // With router navigation
 * <Hero onBegin={() => router.visit('/timeline')} />
 */
export default function Hero({ onBegin }) {
    return (
        <section className="relative h-screen flex items-center justify-center bg-black">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black" />
            
            {/* Content */}
            <div className="relative z-10 text-center px-4">
                {/* Typewriter Title */}
                <div className="text-5xl md:text-7xl font-bold mb-6">
                    {"Chronicles of ".split("").map((letter, index) => (
                        <motion.span
                            key={`chronicles-${index}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.1, delay: index * 0.05 }}
                            className="text-white"
                        >
                            {letter === " " ? "\u00A0" : letter}
                        </motion.span>
                    ))}
                    <br />
                    {"Human Creativity".split("").map((letter, index) => (
                        <motion.span
                            key={`creativity-${index}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ 
                                duration: 0.1, 
                                delay: ("Chronicles of ".length * 0.05) + (index * 0.05) 
                            }}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
                        >
                            {letter === " " ? "\u00A0" : letter}
                        </motion.span>
                    ))}
                </div>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 0.8 }}
                    className="text-xl text-gray-300 mb-8"
                >
                    A guided journey through the evolution of art.
                </motion.p>

                {/* CTA Button */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.5, duration: 0.8 }}
                    onClick={onBegin}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
                >
                    Begin the Journey
                </motion.button>
            </div>
        </section>
    );
}
