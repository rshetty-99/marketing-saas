'use client';

import { useEffect, useRef, useCallback } from 'react';

interface BlogAnalyticsProps {
  postId: string;
  workspaceId: string;
}

/**
 * Invisible analytics tracker for blog posts.
 * Records: view, scroll depth, time on page, share clicks, CTA clicks.
 * Uses navigator.sendBeacon for reliable delivery on page unload.
 */
export function BlogAnalytics({ postId, workspaceId }: BlogAnalyticsProps) {
  const startTimeRef = useRef<number>(Date.now());
  const maxDepthRef = useRef<number>(0);
  const viewRecordedRef = useRef(false);

  // Record view on mount
  useEffect(() => {
    if (viewRecordedRef.current) return;
    viewRecordedRef.current = true;

    const url = new URL(window.location.href);
    const payload = JSON.stringify({
      postId,
      workspaceId,
      eventType: 'view',
      data: {
        referrer: document.referrer || undefined,
        utmSource: url.searchParams.get('utm_source') || undefined,
        utmMedium: url.searchParams.get('utm_medium') || undefined,
        utmCampaign: url.searchParams.get('utm_campaign') || undefined,
      },
      timestamp: Date.now(),
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/blog/analytics', payload);
    } else {
      fetch('/api/blog/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Analytics should never block UX
      });
    }
  }, [postId, workspaceId]);

  // Scroll depth tracking with IntersectionObserver at 25/50/75/100% markers
  useEffect(() => {
    const markers = document.querySelectorAll('[data-scroll-marker]');
    if (markers.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const depth = parseInt(
              (entry.target as HTMLElement).dataset.scrollMarker ?? '0',
              10,
            );
            if (depth > maxDepthRef.current) {
              maxDepthRef.current = depth;
            }
          }
        }
      },
      { threshold: 0.5 },
    );

    markers.forEach((m) => observer.observe(m));
    return () => observer.disconnect();
  }, []);

  // Send scroll depth + time on page on unload
  const sendScrollBeacon = useCallback(() => {
    const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000);
    const payload = JSON.stringify({
      postId,
      workspaceId,
      eventType: 'scroll',
      data: {
        scrollDepth: maxDepthRef.current,
        readCompleted: maxDepthRef.current >= 100,
        timeOnPageSeconds: timeOnPage,
      },
      timestamp: Date.now(),
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/blog/analytics', payload);
    } else {
      fetch('/api/blog/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Silently fail
      });
    }
  }, [postId, workspaceId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendScrollBeacon();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', sendScrollBeacon);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', sendScrollBeacon);
    };
  }, [sendScrollBeacon]);

  // Listen for share clicks on elements with data-blog-share attribute
  useEffect(() => {
    function handleShareClick(event: MouseEvent) {
      const target = (event.target as HTMLElement).closest('[data-blog-share]') as HTMLElement | null;
      if (!target) return;

      const platform = target.dataset.blogShare ?? 'unknown';
      const payload = JSON.stringify({
        postId,
        workspaceId,
        eventType: 'share',
        data: { sharePlatform: platform },
        timestamp: Date.now(),
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/blog/analytics', payload);
      } else {
        fetch('/api/blog/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {
          // Silently fail
        });
      }
    }

    document.addEventListener('click', handleShareClick);
    return () => document.removeEventListener('click', handleShareClick);
  }, [postId, workspaceId]);

  // Listen for CTA clicks on elements with data-blog-cta attribute
  useEffect(() => {
    function handleCtaClick(event: MouseEvent) {
      const target = (event.target as HTMLElement).closest('[data-blog-cta]') as HTMLElement | null;
      if (!target) return;

      const payload = JSON.stringify({
        postId,
        workspaceId,
        eventType: 'cta_click',
        data: {},
        timestamp: Date.now(),
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/blog/analytics', payload);
      } else {
        fetch('/api/blog/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {
          // Silently fail
        });
      }
    }

    document.addEventListener('click', handleCtaClick);
    return () => document.removeEventListener('click', handleCtaClick);
  }, [postId, workspaceId]);

  // No UI rendered — tracking-only component
  return <div data-testid="blog-analytics" style={{ display: 'none' }} />;
}
