"use client";

import { motion } from "framer-motion";
import { Sparkles, Wand2, Image as ImageIcon } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Powered",
    desc: "Advanced AI technology",
    bg: "from-black/60 to-neutral-900/60",
    border: "border-red-700",
  },
  {
    icon: Wand2,
    title: "Easy Editing",
    desc: "Intuitive tools",
    bg: "from-black/60 to-neutral-900/60",
    border: "border-neutral-700",
  },
  {
    icon: ImageIcon,
    title: "High Quality",
    desc: "Stunning resolution",
    bg: "from-black/60 to-neutral-900/60",
    border: "border-neutral-700",
  },
];

export function FeatureSection() {
  return (
    <section className="w-full py-20 bg-gradient-to-b from-neutral-900 via-black to-neutral-950 overflow-hidden">
      <div className="container mx-auto max-w-4xl px-4">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center text-3xl sm:text-4xl font-extrabold text-white mb-1"
        >
          What Makes Us Unique
        </motion.h2>
        <div className="mx-auto mb-12 h-1 w-12 bg-gradient-to-r from-red-600 to-white rounded opacity-80" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-7">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 + idx * 0.1 }}
              className={`rounded-2xl bg-gradient-to-br ${feature.bg} border ${feature.border} shadow hover:shadow-red-700/20 transition-all text-center py-10 px-6 flex flex-col items-center`}
            >
              <div className="mb-3 flex items-center justify-center">
                <feature.icon className="h-8 w-8 text-white/90" />
              </div>
              <div className="text-lg font-semibold text-white mb-1 tracking-widest uppercase">
                {feature.title}
              </div>
              <div className="text-sm text-neutral-300">{feature.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
