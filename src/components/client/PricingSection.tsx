"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function PricingSection() {
  const { data: session } = useSession();

  const handlePurchase = async (credits: number, price: number) => {
    if (!session?.user) {
      // Redirect to sign in
      window.location.href = "/api/auth/signin";
      return;
    }

    try {
      const response = await fetch("/api/payment/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits, price }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  return (
    <section className="relative py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/70">
            Pricing
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
            Get more credits to create unlimited stunning wallpapers
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative rounded-2xl bg-white/5 border border-neutral-700 backdrop-blur-md p-8 hover:bg-white/10 hover:border-red-600/50 transition-all duration-300"
          >
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-neutral-700 text-xs font-semibold text-white mb-4">
                <Sparkles className="h-3 w-3" />
                Free
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Free Tier</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-neutral-400">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-300">5 Credits per month</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-300">Access to gallery</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-300">Basic editor features</span>
              </li>
            </ul>

            {session?.user ? (
              <div className="px-4 py-2 text-center text-sm text-neutral-400 bg-white/5 rounded-lg">
                Current Plan
              </div>
            ) : (
              <Link
                href="/api/auth/signin"
                className="block w-full px-6 py-3 bg-white/5 border border-neutral-700 rounded-xl text-white font-semibold text-center hover:bg-white/10 hover:border-red-600/50 transition-all"
              >
                Sign In to Get Started
              </Link>
            )}
          </motion.div>

          {/* Starter Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative rounded-2xl bg-gradient-to-br from-red-900/20 to-neutral-900/20 border-2 border-red-600/50 backdrop-blur-md p-8 hover:border-red-500 transition-all duration-300 scale-105"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-red-700 to-neutral-700 text-white text-xs font-semibold">
              Popular
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">$1</span>
                <span className="text-neutral-400">one-time</span>
              </div>
              <p className="text-sm text-neutral-400 mt-2">15 Credits</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-300">15 Credits</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-300">No expiration</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-300">All editor features</span>
              </li>
            </ul>

            <button
              onClick={() => handlePurchase(15, 1)}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-700 to-neutral-700 text-white font-semibold rounded-xl hover:from-red-600 hover:to-neutral-800 transition-all"
            >
              Buy Now
            </button>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative rounded-2xl bg-white/5 border border-neutral-700 backdrop-blur-md p-8 hover:bg-white/10 hover:border-red-600/50 transition-all duration-300"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">$5</span>
                <span className="text-neutral-400">one-time</span>
              </div>
              <p className="text-sm text-neutral-400 mt-2">100 Credits</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-300">100 Credits</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-300">Best value</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-neutral-300">All premium features</span>
              </li>
            </ul>

            <button
              onClick={() => handlePurchase(100, 5)}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-700 to-neutral-700 text-white font-semibold rounded-xl hover:from-red-600 hover:to-neutral-800 transition-all"
            >
              Buy Now
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

