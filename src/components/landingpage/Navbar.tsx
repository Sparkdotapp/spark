"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X } from 'lucide-react';

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: 'Events', href: '/events' },
  { label: 'Communities', href: '/communities' },
  { label: 'PitchPal', href: '/pitchpal' },
  { label: 'Projects', href: '/projects' },
  { label: 'Social', href: '/social' },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent hydration mismatch: only apply scrolled class after mount
  const headerClass = hasMounted && scrolled
    ? 'bg-[rgba(17,17,19,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)]'
    : 'bg-transparent';

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-[72px]">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-[#DAFF01] flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
              <Zap className="w-5 h-5 text-[rgb(17,17,19)]" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SPARK</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link: NavLink) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-[rgb(218,218,218)] rounded-lg transition-all duration-200 hover:text-white hover:bg-[rgba(255,255,255,0.06)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#"
              className="px-4 py-2 text-sm font-medium text-[rgb(218,218,218)] rounded-lg transition-all duration-200 hover:text-white"
            >
              Sign In
            </a>
            <button className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] transition-all duration-200 hover:bg-[rgb(166,190,21)] hover:shadow-[0_8px_25px_rgba(218,255,1,0.3)] hover:-translate-y-0.5 active:translate-y-0">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-[rgba(255,255,255,0.06)] transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 pt-[72px] bg-[rgba(17,17,19,0.97)] backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col p-6 gap-2">
              {navLinks.map((link: NavLink) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-lg font-medium text-[rgb(218,218,218)] rounded-xl transition-colors hover:text-white hover:bg-[rgba(255,255,255,0.06)]"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.1)] flex flex-col gap-3">
                <button className="w-full py-3 text-base font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] transition-all duration-200 hover:bg-[rgb(166,190,21)]">
                  Get Started
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
