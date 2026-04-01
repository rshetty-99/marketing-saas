export default async function PortalDashboardPage() {
  return (
    <div data-testid="portal-dashboard" className="flex flex-col gap-6">
      <h1 className="text-display-2xl font-display text-foreground">
        Client Portal
      </h1>
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-body-md font-body text-muted-foreground">
          Reports coming soon
        </p>
      </div>
    </div>
  );
}
