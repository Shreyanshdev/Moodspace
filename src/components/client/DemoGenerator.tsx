"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function DemoGenerator() {
  return (
    <section className="relative py-28 px-4 bg-gradient-to-b from-neutral-950 via-black to-neutral-900">
      <div className="absolute inset-0 pointer-events-none backdrop-blur-2xl"></div>
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-2xl bg-black/70 border border-red-700/30 backdrop-blur-md shadow-lg mx-auto overflow-hidden px-8 py-14 sm:py-20 text-center flex flex-col items-center"
        >
          {/* Minimal badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mb-6 inline-block rounded-full border border-red-900/50 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-neutral-100/80"
          >
            Ready to Create?
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-normal"
          >
            Start Creating Your
            <br />
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-white to-neutral-200">
              Perfect Wallpaper
              <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-red-700 to-white/80 rounded opacity-70"></span>
            </span>
          </motion.h2>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="text-lg text-neutral-300 mb-7 max-w-xl mx-auto"
          >
            Join thousands of creators transforming their ideas into stunning wallpapers. No logins or payments—just your imagination and a single click.
          </motion.p>

          {/* Custom Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto"
          >
            <Link
              href="/generate"
              className="group relative inline-flex items-center justify-center rounded-xl px-10 py-5 bg-gradient-to-r from-red-700 via-neutral-900 to-neutral-700 text-white font-semibold text-lg shadow-md tracking-wide uppercase transition-all
                hover:from-red-600 hover:to-neutral-800 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-700"
            >
              <span>Get Started Free</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/gallery"
              className="inline-flex items-center justify-center rounded-xl px-10 py-5 bg-white/5 border border-neutral-700 text-neutral-100 font-semibold text-lg tracking-wide uppercase
                transition-all duration-200 hover:text-white hover:bg-red-600/20 hover:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <span>Explore Gallery</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
