'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Integrations', href: '#integrations' },
  { label: 'Blog', href: '/blog' },
];

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl transition-all duration-500 ${
          scrolled ? 'top-2' : 'top-4'
        }`}
      >
        <nav
          className={`relative flex items-center justify-between px-4 md:px-6 rounded-2xl border transition-all duration-500 ${
            scrolled
              ? 'h-14 bg-background/80 backdrop-blur-xl border-border shadow-lg shadow-black/5 dark:shadow-black/20'
              : 'h-16 bg-background/70 dark:bg-background/40 backdrop-blur-md border-transparent'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 19h20L12 2z" className="text-brand-void" />
              </svg>
            </div>
            <span className="font-display text-lg font-medium tracking-tight">Aura</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-ui text-muted-foreground hover:text-foreground transition-colors group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand-orange rounded-full transition-all duration-300 group-hover:w-6" />
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex text-sm font-ui text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-ui font-medium text-white bg-gradient-to-r from-brand-orange to-brand-indigo hover:opacity-90 transition-opacity shadow-lg shadow-brand-orange/20"
            >
              Start Free
            </Link>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-4 top-24 z-40 p-4 rounded-2xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl md:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl text-sm font-ui hover:bg-muted transition-colors">
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-border" />
              <Link href="/sign-in" className="px-4 py-3 rounded-xl text-sm font-ui hover:bg-muted transition-colors">Sign in</Link>
              <Link href="/sign-up" className="mt-1 px-4 py-3 rounded-xl text-sm font-ui font-medium text-center text-white bg-gradient-to-r from-brand-orange to-brand-indigo">Start Free</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
