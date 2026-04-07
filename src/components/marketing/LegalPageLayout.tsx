'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, Printer, ArrowUp } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  number: number;
}

interface LegalPageLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  effectiveDate?: string;
  version?: string;
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  subtitle,
  lastUpdated,
  effectiveDate,
  version,
  children,
}: LegalPageLayoutProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [tocOpen, setTocOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const headings = contentRef.current.querySelectorAll('h2');
    const items: TOCItem[] = [];
    headings.forEach((h, i) => {
      const id =
        h.id ||
        h.textContent
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') ||
        '';
      if (!h.id) h.id = id;
      items.push({ id, text: h.textContent || '', number: i + 1 });
    });
    setTocItems(items);
  }, [children]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 },
    );
    if (!contentRef.current) return;
    contentRef.current.querySelectorAll('h2').forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [tocItems]);

  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div className="relative border-b border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2 text-xs font-ui text-muted-foreground mb-6">
              <a href="/" className="hover:text-foreground transition-colors">Home</a>
              <span>/</span>
              <span className="text-foreground">{title}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <h1 className="font-display font-medium tracking-tight text-display-lg md:text-display-xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-2 text-body-md text-muted-foreground max-w-2xl">{subtitle}</p>
                )}
              </div>

              <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                <div className="flex flex-wrap gap-2">
                  {version && (
                    <span className="inline-flex items-center rounded-md bg-brand-orange/10 px-2.5 py-1 text-xs font-ui font-medium text-brand-orange ring-1 ring-brand-orange/20">
                      {version}
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-ui text-muted-foreground">
                    Updated {lastUpdated}
                  </span>
                  {effectiveDate && (
                    <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-ui text-muted-foreground">
                      Effective {effectiveDate}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-ui text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([contentRef.current?.innerText ?? ''], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-ui text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex gap-12">
          {/* Desktop TOC */}
          <aside className="hidden lg:block w-64 shrink-0">
            <nav className="sticky top-24">
              <p className="text-label text-muted-foreground mb-4">Table of Contents</p>
              <div className="space-y-0.5 border-l-2 border-border">
                {tocItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setActiveId(item.id)}
                    className={`flex items-start gap-2.5 pl-4 py-2 text-sm transition-all rounded-r-lg ${
                      activeId === item.id
                        ? 'text-brand-orange border-l-2 border-brand-orange -ml-[2px] font-medium bg-brand-orange/5'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <span className={`shrink-0 w-5 text-right font-mono text-[11px] mt-0.5 ${
                      activeId === item.id ? 'text-brand-orange' : 'text-muted-foreground/50'
                    }`}>
                      {item.number}.
                    </span>
                    <span className="leading-snug">{item.text}</span>
                  </a>
                ))}
              </div>
              <div className="mt-8 p-4 rounded-xl bg-card border border-border">
                <p className="text-xs font-ui font-medium text-foreground mb-2">Questions?</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Contact us at{' '}
                  <a href="mailto:legal@aura.ai" className="text-brand-orange hover:underline">legal@aura.ai</a>
                </p>
              </div>
            </nav>
          </aside>

          {/* Mobile TOC */}
          <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
            {tocItems.length > 0 && (
              <motion.div
                initial={false}
                className="rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/10 dark:shadow-black/30"
              >
                <button
                  onClick={() => setTocOpen(!tocOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-ui font-medium"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-orange" />
                    Contents
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${tocOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {tocOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 max-h-64 overflow-y-auto border-t border-border">
                        {tocItems.map((item) => (
                          <a
                            key={item.id}
                            href={`#${item.id}`}
                            onClick={() => setTocOpen(false)}
                            className={`flex items-center gap-2 py-2 text-sm ${
                              activeId === item.id ? 'text-brand-orange font-medium' : 'text-muted-foreground'
                            }`}
                          >
                            <span className="font-mono text-[11px] text-muted-foreground/50 w-4 text-right">{item.number}.</span>
                            {item.text}
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Content */}
          <motion.article
            ref={contentRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 min-w-0 legal-content"
          >
            {children}
          </motion.article>
        </div>
      </div>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-brand-orange text-white shadow-lg shadow-brand-orange/20 flex items-center justify-center hover:bg-brand-orange-hover transition-colors lg:bottom-6 lg:right-6"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
