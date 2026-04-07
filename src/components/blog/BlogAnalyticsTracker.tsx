'use client';

import { useEffect, useRef, useCallback } from 'react';

interface BlogAnalyticsTrackerProps {
  postId: string;
  workspaceId: string;
}

export function BlogAnalyticsTracker({ postId, workspaceId }: BlogAnalyticsTrackerProps) {
  const startTimeRef = useRef<number>(Date.now());
  const maxDepthRef = useRef<number>(0);
  const viewRecordedRef = useRef(false);

  // Record view on mount
  useEffect(() => {
    if (viewRecordedRef.current) return;
    viewRecordedRef.current = true;

    const url = new URL(window.location.href);

    fetch('/api/blog/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        workspaceId,
        eventType: 'view',
        referrer: document.referrer || undefined,
        utmSource: url.searchParams.get('utm_source') || undefined,
        utmMedium: url.searchParams.get('utm_medium') || undefined,
        utmCampaign: url.searchParams.get('utm_campaign') || undefined,
      }),
    }).catch(() => {
      // Silently fail — analytics should never block UX
    });
  }, [postId, workspaceId]);

  // Scroll depth tracking with IntersectionObserver
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

  // Send final scroll depth + time on page when leaving
  const sendBeacon = useCallback(() => {
    const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000);
    const payload = JSON.stringify({
      postId,
      workspaceId,
      eventType: 'scroll',
      scrollDepth: maxDepthRef.current,
      readCompleted: maxDepthRef.current >= 100,
      timeOnPageSeconds: timeOnPage,
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
        sendBeacon();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', sendBeacon);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', sendBeacon);
    };
  }, [sendBeacon]);

  // No visible UI
  return null;
}
