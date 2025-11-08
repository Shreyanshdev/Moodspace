import Link from "next/link";
import { Github, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-neutral-800 bg-gradient-to-b from-black/70 via-neutral-900 to-black/95 backdrop-blur-2xl">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Site Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-white font-[cursive] select-none tracking-widest">
                MoodScape
              </span>
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Transform your mood into stunning wallpapers powered by AI—minimal, beautiful, free.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <a href="#" className="text-neutral-400 hover:text-red-500 transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-red-500 transition-colors" aria-label="Github">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-red-500 transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white/80 tracking-widest">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/generate" className="group text-neutral-300 hover:text-white transition-colors flex items-center gap-2">
                  <span className="h-0.5 w-0 bg-gradient-to-r from-red-600 to-white group-hover:w-2 transition-all rounded"></span>
                  Generate
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="group text-neutral-300 hover:text-white transition-colors flex items-center gap-2">
                  <span className="h-0.5 w-0 bg-gradient-to-r from-red-600 to-white group-hover:w-2 transition-all rounded"></span>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="group text-neutral-300 hover:text-white transition-colors flex items-center gap-2">
                  <span className="h-0.5 w-0 bg-gradient-to-r from-red-600 to-white group-hover:w-2 transition-all rounded"></span>
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white/80 tracking-widest">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="group text-neutral-300 hover:text-white transition-colors flex items-center gap-2">
                  <span className="h-0.5 w-0 bg-gradient-to-r from-red-600 to-white group-hover:w-2 transition-all rounded"></span>
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="group text-neutral-300 hover:text-white transition-colors flex items-center gap-2">
                  <span className="h-0.5 w-0 bg-gradient-to-r from-red-600 to-white group-hover:w-2 transition-all rounded"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white/80 tracking-widest">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="group text-neutral-300 hover:text-white transition-colors flex items-center gap-2">
                  <span className="h-0.5 w-0 bg-gradient-to-r from-red-600 to-white group-hover:w-2 transition-all rounded"></span>
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="group text-neutral-300 hover:text-white transition-colors flex items-center gap-2">
                  <span className="h-0.5 w-0 bg-gradient-to-r from-red-600 to-white group-hover:w-2 transition-all rounded"></span>
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-400">
              &copy; {new Date().getFullYear()} MoodScape. All rights reserved.
            </p>
            <p className="text-sm text-neutral-400">
              Made with <span className="text-red-500">❤️</span> for creators
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
