'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: ReactNode;
  heading: string;
  subheading: string;
}

/**
 * Split-panel auth layout inspired by shadcn login-02.
 * Left: form content with Aura branding.
 * Right: dramatic brand visual panel.
 */
export function AuthLayout({ children, heading, subheading }: AuthLayoutProps) {
  return (
    <div className="grid h-svh lg:grid-cols-2 overflow-hidden">
      {/* ─── LEFT: Form Panel ─── */}
      <div className="flex flex-col gap-2 p-4 sm:gap-4 sm:p-6 md:gap-6 md:p-10 bg-background overflow-hidden">
        {/* Brand mark */}
        <div className="flex justify-center md:justify-start">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-orange transition-transform duration-300 ease-spring group-hover:scale-110">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-4.5"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 19h20L12 2z" className="text-brand-void" />
              </svg>
            </div>
            <span className="text-heading-md font-display tracking-tight text-foreground">
              Aura
            </span>
          </a>
        </div>

        {/* Centered form content */}
        <div className="flex flex-1 min-h-0 items-center justify-center">
          <motion.div
            className="w-full max-w-sm"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col gap-1 text-center mb-4 sm:mb-6 md:mb-8 sm:gap-2">
              <h1 className="text-heading-lg sm:text-display-lg text-foreground">{heading}</h1>
              <p className="text-body-sm font-body text-muted-foreground text-balance">
                {subheading}
              </p>
            </div>
            {children}
          </motion.div>
        </div>

        {/* Footer */}
        <p className="text-center text-body-sm text-muted-foreground/60 md:text-left">
          &copy; {new Date().getFullYear()} Aura.ai — Every brand deserves a halo.
        </p>
      </div>

      {/* ─── RIGHT: Brand Visual Panel ─── */}
      <div className="relative hidden overflow-hidden bg-brand-void lg:block">
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Gradient mesh background */}
        <div className="absolute inset-0">
          <div className="absolute -top-1/4 -right-1/4 h-[80%] w-[80%] rounded-full bg-brand-orange/8 blur-[120px]" />
          <div className="absolute -bottom-1/4 -left-1/4 h-[60%] w-[60%] rounded-full bg-brand-indigo/10 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[40%] w-[40%] rounded-full bg-brand-orange/5 blur-[80px]" />
        </div>

        {/* Geometric accent lines */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.06]"
          viewBox="0 0 800 800"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <line x1="0" y1="200" x2="800" y2="600" stroke="#FF4D00" strokeWidth="1" />
          <line x1="200" y1="0" x2="600" y2="800" stroke="#4F35F5" strokeWidth="1" />
          <line x1="400" y1="0" x2="800" y2="400" stroke="#FF4D00" strokeWidth="0.5" />
          <circle cx="400" cy="400" r="200" stroke="#FF4D00" strokeWidth="0.5" />
          <circle cx="400" cy="400" r="300" stroke="#4F35F5" strokeWidth="0.5" />
        </svg>

        {/* Centered brand content */}
        <motion.div
          className="relative z-10 flex h-full flex-col items-center justify-center px-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Large display mark */}
          <div className="mb-4 xl:mb-8">
            <div className="flex size-16 xl:size-20 items-center justify-center rounded-2xl bg-brand-orange/10 border border-brand-orange/20 backdrop-blur-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-8 xl:size-10"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 19h20L12 2z" className="text-brand-orange" />
              </svg>
            </div>
          </div>

          <h2
            className="text-center text-brand-ghost/90 mb-2 xl:mb-4"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)',
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            Every brand
            <br />
            deserves a{' '}
            <span className="text-brand-orange">halo</span>.
          </h2>

          <p
            className="text-center max-w-xs"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              color: 'var(--color-brand-muted)',
            }}
          >
            36 AI skills, one platform — built for agencies
            managing 5–100 client accounts.
          </p>

          {/* Stats row */}
          <div className="mt-6 xl:mt-12 flex gap-10">
            {[
              { value: '36', label: 'AI Skills' },
              { value: '100+', label: 'Clients' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-brand-ghost/80"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  className="mt-1"
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase' as const,
                    color: 'var(--color-brand-muted)',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
