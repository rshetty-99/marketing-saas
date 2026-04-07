'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  function togglePlay() {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }

  function toggleMute() {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
      {/* Background Video — hidden on mobile, shown on md+ */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover hidden md:block"
      >
        <source src="/market-hero.mp4" type="video/mp4" />
      </video>

      {/* Mobile: static gradient background with text overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-orange via-[#FF2D55] to-brand-indigo md:hidden" />

      {/* Mobile headline overlay */}
      <div className="relative z-20 flex flex-col items-center justify-center px-6 text-center md:hidden">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-medium uppercase tracking-tight leading-[0.95]"
          style={{ fontSize: 'clamp(2.5rem, 12vw, 4.5rem)' }}
        >
          Stop Juggling.
          <br />
          Start Shipping.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-4 text-white/80 text-body-md max-w-sm font-ui"
        >
          The AI marketing co-pilot for agencies that move fast.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 flex gap-3"
        >
          <a
            href="/sign-up"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-ui font-semibold text-brand-void shadow transition-colors hover:bg-white/90"
          >
            Start free trial
          </a>
          <a
            href="#features"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white/15 px-8 text-sm font-ui font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
          >
            Learn more
          </a>
        </motion.div>
      </div>

      {/* Desktop: Video controls — center of page */}
      <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-3">
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20"
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </button>
        <button
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20"
        >
          {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        </button>
      </div>

      {/* Desktop: CTA Buttons — bottom center */}
      <div className="absolute bottom-32 left-1/2 z-30 -translate-x-1/2 hidden md:flex gap-4">
        <a
          href="/sign-up"
          className="inline-flex h-12 items-center justify-center rounded-full bg-brand-orange px-8 text-sm font-ui font-semibold text-white shadow transition-colors hover:bg-brand-orange-hover"
        >
          Start free trial
        </a>
        <a
          href="#features"
          className="inline-flex h-12 items-center justify-center rounded-full bg-white/10 px-8 text-sm font-ui font-semibold text-white shadow backdrop-blur transition-colors hover:bg-white/20"
        >
          Demo
        </a>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute inset-x-0 bottom-0 z-20 h-48 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
