'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
}

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [tocOpen, setTocOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const headings = contentRef.current.querySelectorAll('h2');
    const items: TOCItem[] = [];
    headings.forEach((h) => {
      const id = h.id || h.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '';
      if (!h.id) h.id = id;
      items.push({ id, text: h.textContent || '' });
    });
    setTocItems(items);
  }, [children]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );

    if (!contentRef.current) return;
    const headings = contentRef.current.querySelectorAll('h2');
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [tocItems]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-ui text-muted-foreground mb-6">
            Last updated: {lastUpdated}
          </span>
          <h1 className="font-display font-medium text-display-lg md:text-display-xl tracking-tight mb-8">
            {title}
          </h1>
        </motion.div>

        <div className="flex gap-12">
          {/* Sidebar TOC — desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="sticky top-24">
              <p className="text-label text-muted-foreground mb-4">On this page</p>
              <ul className="space-y-1.5 border-l border-border">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={() => setActiveId(item.id)}
                      className={`block pl-4 py-1 text-sm transition-colors ${
                        activeId === item.id
                          ? 'text-brand-orange border-l-2 border-brand-orange -ml-[1px] font-medium'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Mobile TOC */}
          <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
            {tocItems.length > 0 && (
              <div className="rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-lg">
                <button
                  onClick={() => setTocOpen(!tocOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-ui font-medium"
                >
                  <span>Table of Contents</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${tocOpen ? 'rotate-180' : ''}`} />
                </button>
                {tocOpen && (
                  <div className="px-4 pb-3 max-h-64 overflow-y-auto">
                    <ul className="space-y-1.5">
                      {tocItems.map((item) => (
                        <li key={item.id}>
                          <a
                            href={`#${item.id}`}
                            onClick={() => setTocOpen(false)}
                            className={`block py-1 text-sm ${
                              activeId === item.id ? 'text-brand-orange font-medium' : 'text-muted-foreground'
                            }`}
                          >
                            {item.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
            className="flex-1 min-w-0 prose prose-neutral dark:prose-invert max-w-none
              prose-headings:font-heading prose-headings:scroll-mt-24
              prose-h2:text-heading-lg prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-heading-md prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-body-md prose-p:text-muted-foreground prose-p:mb-4
              prose-li:text-body-sm prose-li:text-muted-foreground
              prose-strong:text-foreground prose-strong:font-medium
              prose-a:text-brand-orange prose-a:no-underline hover:prose-a:underline"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
