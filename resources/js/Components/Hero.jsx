import React from "react";
// import ThreeBackground from "./ThreeBackground";  
import { motion, useScroll, useTransform } from "framer-motion"; // ✅ Changed here

export default function Hero({ onBegin }) {
  const { scrollY } = useScroll(); // ✅ Changed here
  
  // Remove these if you're not using them:
  // const bgY = useTransform(scrollY, [0, 300], [0, -120]);
  // const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  // const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* 3D BACKGROUND */}
      {/* <div className="absolute inset-0 z-0">
        <ThreeBackground />
      </div> */}

      {/* CONTENT */}
      <div className="relative z-30 max-w-7xl mx-auto px-6 h-full flex items-center justify-center text-center">
        {/* LEFT SIDE: TEXT */}
        <div className="flex flex-col items-center">
          
          {/* TYPEWRITER TITLE */}
          <motion.h1
            className="text-white font-display text-7xl font-bold leading-tight inline-block"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  delayChildren: 0.10,
                  staggerChildren: 0.09,   // speed of typing
                },
              },
            }}
          >
            {"Chronicles of ".split("").map((letter, index) => (
              <motion.span
                key={"line1-" + index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}

            <br />

            {"Human Creativity".split("").map((letter, index) => (
              <motion.span
                key={"line2-" + index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}  
          </motion.h1>

          {/* SUBTITLE AFTER TYPEWRITER */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, delay: 2.4 }}  // wait for typing to finish
            className="mt-4 text-gray-200 text-lg"
          >
            A guided journey through the evolution of art.
          </motion.p>

          {/* BUTTON */}
          <motion.button
            onClick={onBegin}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, delay: 2.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-16 px-5 py-3 bg-white/10 border border-white/30 rounded-lg text-white backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer pointer-events-auto relative z-50"
          >
            Begin the Journey
          </motion.button>
        </div>
      </div>
    </section>
  );
}
