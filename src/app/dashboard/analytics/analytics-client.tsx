'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Eye, MousePointerClick, Heart, TrendingUp, TrendingDown,
  FileText, Download, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

interface PipelineHealth {
  draft: number;
  submitted: number;
  approved: number;
  scheduled: number;
  published: number;
  rejected: number;
  archived: number;
}

interface AnalyticsClientProps {
  initialMetrics: {
    kpis: Record<string, unknown>;
    chartData: Record<string, unknown>[];
    pipelineHealth: PipelineHealth;
    topPosts: Record<string, unknown>[];
  };
  canExport: boolean;
}

const DATE_RANGES = [
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'last_90_days', label: 'Last 90 days' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
];

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function AnalyticsClient({ initialMetrics, canExport }: AnalyticsClientProps) {
  const [dateRange, setDateRange] = useState('last_30_days');
  const [metrics, setMetrics] = useState(initialMetrics);

  async function handleDateRangeChange(range: string) {
    setDateRange(range);
    try {
      const res = await fetch(`/api/analytics?dateRange=${range}`);
      const data = await res.json();
      setMetrics(data);
    } catch {
      // handle error
    }
  }

  const kpis = metrics.kpis;
  const pipeline = metrics.pipelineHealth;
  const chartData = metrics.chartData;

  const kpiCards = [
    {
      label: 'Impressions',
      value: formatNumber(kpis.impressions as number ?? 0),
      icon: Eye,
      color: 'text-blue-500',
    },
    {
      label: 'Engagement',
      value: formatNumber(kpis.engagement as number ?? 0),
      icon: Heart,
      color: 'text-pink-500',
    },
    {
      label: 'Clicks',
      value: formatNumber(kpis.clicks as number ?? 0),
      icon: MousePointerClick,
      color: 'text-green-500',
    },
    {
      label: 'Engagement Rate',
      value: formatPercent(kpis.engagementRate as number ?? 0),
      icon: TrendingUp,
      color: 'text-brand-orange',
    },
    {
      label: 'Content Published',
      value: String(kpis.contentPublished ?? 0),
      icon: FileText,
      color: 'text-purple-500',
    },
    {
      label: 'Follower Growth',
      value: `${(kpis.followerDelta as number) > 0 ? '+' : ''}${kpis.followerDelta ?? 0}`,
      icon: (kpis.followerDelta as number) >= 0 ? TrendingUp : TrendingDown,
      color: (kpis.followerDelta as number) >= 0 ? 'text-green-500' : 'text-red-500',
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-heading-xl font-display text-foreground" data-testid="analytics-heading">Analytics</h1>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-40" data-testid="date-range-selector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canExport && (
            <Button variant="outline" size="sm" data-testid="export-button">
              <Download className="size-4 mr-1.5" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" data-testid="kpi-cards">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`size-4 ${kpi.color}`} />
                  <span className="text-label text-muted-foreground">{kpi.label}</span>
                </div>
                <p className="text-heading-lg font-display text-foreground">{kpi.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Engagement Chart (placeholder — Recharts integration) */}
      <Card data-testid="engagement-chart">
        <CardHeader>
          <CardTitle className="font-display">Engagement Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-64 flex items-end gap-1">
              {chartData.slice(-30).map((point, i) => {
                const maxEngagement = Math.max(...chartData.map((p) => (p.engagement as number) ?? 0));
                const height = maxEngagement > 0
                  ? ((point.engagement as number ?? 0) / maxEngagement) * 100
                  : 0;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-brand-orange/60 hover:bg-brand-orange rounded-t transition-colors"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${point.date}: ${point.engagement} engagement`}
                  />
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data for this period
            </div>
          )}
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>{chartData[0]?.date as string ?? ''}</span>
            <span>{chartData[chartData.length - 1]?.date as string ?? ''}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline Health */}
        <Card data-testid="pipeline-health">
          <CardHeader>
            <CardTitle className="font-display">Content Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(pipeline).map(([status, count]) => {
                const total = Object.values(pipeline).reduce((sum, v) => sum + v, 0);
                const pct = total > 0 ? (count / total) * 100 : 0;
                const statusColors: Record<string, string> = {
                  draft: 'bg-muted-foreground',
                  submitted: 'bg-yellow-500',
                  approved: 'bg-green-500',
                  scheduled: 'bg-blue-500',
                  published: 'bg-brand-orange',
                  rejected: 'bg-red-500',
                  archived: 'bg-muted',
                };
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="text-body-sm text-muted-foreground w-20 capitalize">{status}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${statusColors[status] ?? 'bg-muted-foreground'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-body-sm font-ui text-foreground w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Posts */}
        <Card data-testid="top-posts">
          <CardHeader>
            <CardTitle className="font-display">Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topPosts.length > 0 ? (
              <div className="space-y-3">
                {metrics.topPosts.map((post, i) => (
                  <div key={post.id as string} className="flex items-center gap-3">
                    <span className="text-heading-md font-display text-muted-foreground w-6">{i + 1}</span>
                    <div className="flex-1">
                      <p className="font-ui text-sm text-foreground truncate">{post.title as string}</p>
                      <div className="flex gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px]">{post.platform as string}</Badge>
                        <span className="text-[11px] text-muted-foreground">{post.engagement as number} engagements</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body-sm text-muted-foreground text-center py-4">
                Publish content to see top performers here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
