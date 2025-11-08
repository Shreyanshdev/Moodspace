import { HeroSection } from "@/components/client/HeroSection";
import { FeatureSection } from "@/components/client/FeatureSection";
import { DemoGenerator } from "@/components/client/DemoGenerator";
import { PricingSection } from "@/components/client/PricingSection";
import { Navbar } from "@/components/client/Navbar";
import { Footer } from "@/components/server/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black relative overflow-hidden">
      {/* Minimal and luxurious animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Soft blurred red glow, extremely subtle and luxurious */}
        <div className="absolute -top-44 -right-44 w-96 h-96 rounded-full bg-red-900/10 blur-2xl opacity-70"></div>
        <div className="absolute -bottom-44 -left-44 w-96 h-96 rounded-full bg-white/10 blur-2xl opacity-40"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-red-700/5 blur-2xl opacity-60"></div>
        {/* The above orbs are extremely low opacity and neutral, matching new theme */}
      </div>

      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <FeatureSection />
        <PricingSection />
        <DemoGenerator />
        <Footer />
      </div>
    </main>
  );
}
