"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-neutral-900 to-neutral-800 px-4 py-20">
      <div className="absolute inset-0 backdrop-blur-2xl" />

      <div className="z-10 mx-auto w-full max-w-3xl px-2 py-12 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/70 shadow"
        >
          AI-Powered Wallpaper Generator
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl font-extrabold text-white mb-4 leading-tight"
        >
          <span>
            Your Mood
            <span className="block w-16 h-1 mt-2 mx-auto rounded bg-gradient-to-r from-red-600 to-white opacity-90"></span>
          </span>
          <span className="block text-neutral-200 mt-3">Your Wallpaper</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 max-w-lg text-lg text-neutral-300"
        >
          Instantly create high-quality, AI-generated wallpapers that match your current vibe. Clean, fast, and uniquely yours—no account required.
        </motion.p>

        {/* Custom Buttons (no external component) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8 w-full"
        >
          <Link
            href="/generate"
            className="relative group inline-block rounded-xl px-8 py-4 bg-gradient-to-r from-red-700 to-neutral-700 text-white font-semibold text-lg shadow-md tracking-wide uppercase transition-all
              hover:from-red-600 hover:to-neutral-800 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            Start Creating
            <span className="absolute left-0 bottom-0 w-0 h-1 group-hover:w-full bg-red-600 transition-all duration-300 rounded" />
          </Link>

          <Link
            href="/gallery"
            className="inline-block rounded-xl px-8 py-4 bg-white/5 border border-neutral-700 text-neutral-100 font-semibold text-lg tracking-wide uppercase backdrop-blur-md
              hover:text-white hover:bg-red-600/30 hover:border-red-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Explore Gallery
          </Link>
        </motion.div>

        {/* Minimal stats, tastefully styled */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-row gap-10 justify-center mt-2"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-white">10K+</div>
            <div className="text-xs text-neutral-400 mt-1">Wallpapers Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">5K+</div>
            <div className="text-xs text-neutral-400 mt-1">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">No Account Needed</div>
            <div className="text-xs text-neutral-400 mt-1">Use for Free</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
