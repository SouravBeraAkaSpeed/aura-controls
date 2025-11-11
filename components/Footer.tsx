"use client";

import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer id="footer" className="relative z-10 w-full bg-black border-t border-white/10 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Column 1: Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Aura-Controls Logo" width={32} height={32} />
              <span className="text-xl font-bold text-white">AURA-CONTROLS</span>
            </Link>
            <p className="mt-4 text-white/60 text-sm leading-relaxed">
              The future of human-computer interaction. Command your digital world with a wave of your hand.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h3 className="text-sm font-semibold text-white/90 tracking-wider uppercase">Navigate</h3>
            <ul className="mt-4 space-y-4">
              <li><Link href="#" className="text-white/60 hover:text-purple-400 transition-colors">Home</Link></li>
              <li><Link href="#explore" className="text-white/60 hover:text-purple-400 transition-colors">Explore</Link></li>
              <li><Link href="#pricing" className="text-white/60 hover:text-purple-400 transition-colors">Pricing</Link></li>
              <li><Link href="#contact" className="text-white/60 hover:text-purple-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Connect Links */}
          <div>
            <h3 className="text-sm font-semibold text-white/90 tracking-wider uppercase">Connect</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="https://www.youtube.com/@gralius" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-purple-400 transition-colors">Youtube</a></li>
              <li><a href="https://github.com/SouravBeraAkaSpeed" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-purple-400 transition-colors">GitHub</a></li>
              <li><a href="https://www.linkedin.com/in/sourav-bera-/" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-purple-400 transition-colors">LinkedIn</a></li>
            </ul>
          </div>

          {/* Column 4: Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-white/90 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li><Link href="/privacy-policy" className="text-white/60 hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-white/60 hover:text-purple-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-sm text-white/40">
          <p>&copy; {new Date().getFullYear()} Toil Labs. All rights reserved. Built for the future.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;