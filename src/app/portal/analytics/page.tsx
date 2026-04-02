import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Heart, MousePointerClick, TrendingUp } from 'lucide-react';

export default function PortalAnalyticsPage() {
  // Mock analytics — in production, filtered by clientId from F5 analytics_snapshots
  const kpis = [
    { label: 'Impressions', value: '12,450', icon: Eye, color: 'text-blue-500', delta: '+8%' },
    { label: 'Engagement', value: '1,230', icon: Heart, color: 'text-pink-500', delta: '+12%' },
    { label: 'Clicks', value: '340', icon: MousePointerClick, color: 'text-green-500', delta: '+5%' },
    { label: 'Growth', value: '+180', icon: TrendingUp, color: 'text-brand-orange', delta: 'followers' },
  ];

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="portal-analytics">
      <h1 className="text-heading-xl font-display text-foreground">Analytics</h1>
      <p className="text-body-sm text-muted-foreground">Live performance metrics for your brand — last 30 days.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`size-4 ${kpi.color}`} />
                  <span className="text-label text-muted-foreground">{kpi.label}</span>
                </div>
                <p className="text-heading-lg font-display text-foreground">{kpi.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{kpi.delta}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Engagement chart placeholder */}
      <Card>
        <CardHeader><CardTitle className="font-display">Engagement Over Time</CardTitle></CardHeader>
        <CardContent>
          <div className="h-48 flex items-end gap-1">
            {Array.from({ length: 30 }, (_, i) => {
              const height = 20 + Math.random() * 80;
              return <div key={i} className="flex-1 bg-brand-orange/60 hover:bg-brand-orange rounded-t transition-colors" style={{ height: `${height}%` }} />;
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
