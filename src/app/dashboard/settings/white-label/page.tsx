import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { getWhiteLabelConfig } from '@/lib/whitelabel/whitelabel-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Palette, Mail, FileText, Monitor } from 'lucide-react';

export default async function WhiteLabelPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canManage = await hasPermission('workspace', result.member.role, 'settings.manage');
  if (!canManage) redirect('/dashboard');

  const raw = await getWhiteLabelConfig(result.workspaceId);
  const c = {
    enabled: !!raw?.enabled,
    customDomain: (raw?.customDomain as string) || '',
    domainVerified: !!raw?.domainVerified,
    sslCertificateStatus: (raw?.sslCertificateStatus as string) || '',
    appName: (raw?.appName as string) || '',
    primaryColor: (raw?.primaryColor as string) || '',
    hideAuraBranding: !!raw?.hideAuraBranding,
    emailFromName: (raw?.emailFromName as string) || '',
    emailReplyTo: (raw?.emailReplyTo as string) || '',
    reportCoverLogoUrl: (raw?.reportCoverLogoUrl as string) || '',
    reportHeaderHtml: (raw?.reportHeaderHtml as string) || '',
    portalWelcomeMessage: (raw?.portalWelcomeMessage as string) || '',
    portalPrimaryColor: (raw?.portalPrimaryColor as string) || '',
    portalLogoUrl: (raw?.portalLogoUrl as string) || '',
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard/settings">Settings</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">White Label</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="white-label-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">White-Label Branding</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Customize branding for your clients — domain, logo, colors, emails, and reports.</p>
          </div>
          <Badge variant={c.enabled ? 'default' : 'outline'}>
            {c.enabled ? 'Active' : 'Not Configured'}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Custom Domain */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="size-5 text-brand-orange" />
                <CardTitle className="text-heading-md font-display">Custom Domain</CardTitle>
              </div>
              <CardDescription>Use your own domain for the client portal.</CardDescription>
            </CardHeader>
            <CardContent>
              {c.customDomain ? (
                <div className="space-y-2">
                  <p className="font-ui text-sm">{c.customDomain}</p>
                  <div className="flex gap-2">
                    <Badge variant={c.domainVerified ? 'default' : 'outline'}>
                      {c.domainVerified ? 'Verified' : 'Pending Verification'}
                    </Badge>
                    {c.sslCertificateStatus ? (
                      <Badge variant={c.sslCertificateStatus === 'active' ? 'default' : 'outline'}>
                        SSL: {c.sslCertificateStatus}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="text-body-sm text-muted-foreground">No custom domain configured.</p>
              )}
            </CardContent>
          </Card>

          {/* Brand Identity */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="size-5 text-brand-orange" />
                <CardTitle className="text-heading-md font-display">Brand Identity</CardTitle>
              </div>
              <CardDescription>Logo, colors, and app name.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">App Name</span>
                  <span className="font-ui">{c.appName || 'Aura (default)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primary Color</span>
                  <div className="flex items-center gap-2">
                    {c.primaryColor ? (
                      <><span className="size-4 rounded-full border" style={{ backgroundColor: c.primaryColor }} /><span className="font-mono text-xs">{c.primaryColor}</span></>
                    ) : (
                      <span className="text-muted-foreground">Default</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hide &quot;Powered by Aura&quot;</span>
                  <span className="font-ui">{c.hideAuraBranding ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Branding */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="size-5 text-brand-orange" />
                <CardTitle className="text-heading-md font-display">Email Branding</CardTitle>
              </div>
              <CardDescription>Customize outgoing email appearance.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From Name</span>
                  <span className="font-ui">{c.emailFromName || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reply-To</span>
                  <span className="font-ui">{c.emailReplyTo || 'Not set'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Branding */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-brand-orange" />
                <CardTitle className="text-heading-md font-display">Report Branding</CardTitle>
              </div>
              <CardDescription>Custom headers, footers, and cover logos on exported reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cover Logo</span>
                  <span className="font-ui">{c.reportCoverLogoUrl ? 'Uploaded' : 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custom Header</span>
                  <span className="font-ui">{c.reportHeaderHtml ? 'Configured' : 'Not set'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portal Branding */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Monitor className="size-5 text-brand-orange" />
                <CardTitle className="text-heading-md font-display">Client Portal Branding</CardTitle>
              </div>
              <CardDescription>Customize the client-facing portal experience.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3 text-sm">
                <div>
                  <span className="text-muted-foreground block">Welcome Message</span>
                  <span className="font-ui">{c.portalWelcomeMessage || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Portal Color</span>
                  {c.portalPrimaryColor ? (
                    <div className="flex items-center gap-2">
                      <span className="size-4 rounded-full border" style={{ backgroundColor: c.portalPrimaryColor }} />
                      <span className="font-mono text-xs">{c.portalPrimaryColor}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Default</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block">Portal Logo</span>
                  <span className="font-ui">{c.portalLogoUrl ? 'Uploaded' : 'Not set'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
