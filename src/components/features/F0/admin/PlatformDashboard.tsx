import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  label: string;
  value: number;
  testId: string;
}

function MetricCard({ label, value, testId }: MetricCardProps) {
  return (
    <Card data-testid={testId}>
      <CardContent className="flex flex-col gap-1 pt-6">
        <p className="text-body-sm font-ui text-muted-foreground">{label}</p>
        <p className="text-heading-xl font-display text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

export async function PlatformDashboard() {
  // Placeholder data — real data comes from Firestore aggregation later
  const metrics = {
    totalUsers: 0,
    totalWorkspaces: 0,
    activeTrials: 0,
    mrr: 0,
  };

  return (
    <div data-testid="admin-dashboard" className="flex flex-col gap-6">
      <h2 className="text-heading-xl font-display text-foreground">
        Platform Overview
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Workspaces"
          value={metrics.totalWorkspaces}
          testId="metric-card-total-workspaces"
        />
        <MetricCard
          label="Active Users"
          value={metrics.totalUsers}
          testId="metric-card-active-users"
        />
        <MetricCard
          label="Revenue"
          value={metrics.mrr}
          testId="metric-card-revenue"
        />
      </div>
    </div>
  );
}
