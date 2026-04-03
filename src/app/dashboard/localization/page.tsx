import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { getLocaleConfig } from '@/lib/platform/localization-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Languages, Globe } from 'lucide-react';

export default async function LocalizationPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'content.view');
  if (!canView) redirect('/dashboard');

  const config = await getLocaleConfig(result.workspaceId) as Record<string, unknown> | null;
  const enabledLocales = (config?.enabledLocales ?? []) as string[];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Localization</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="localization-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Localization</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Translate content into multiple languages with AI or manual workflows.</p>
          </div>
          <Button size="sm" data-testid="configure-languages-button"><Languages className="size-4 mr-1.5" />Configure Languages</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card><CardContent className="py-4 flex items-center gap-3"><Globe className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{enabledLocales.length}</p><p className="text-xs text-muted-foreground">Enabled Locales</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><Languages className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{(config?.defaultLocale as string) ?? 'en'}</p><p className="text-xs text-muted-foreground">Default Locale</p></div></CardContent></Card>
        </div>
        <Card>
          <CardContent className="py-6">
            <h2 className="text-heading-md font-display text-foreground mb-4">Configuration</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">Translation Provider</span>
                <Badge variant="outline">{(config?.translationProvider as string) ?? 'AI'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">Auto-Translate</span>
                <Badge variant={config?.autoTranslate ? 'default' : 'outline'}>{config?.autoTranslate ? 'Enabled' : 'Disabled'}</Badge>
              </div>
              <div>
                <span className="text-body-sm text-muted-foreground block mb-2">Enabled Locales</span>
                {enabledLocales.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {enabledLocales.map((locale) => (
                      <Badge key={locale} variant="secondary">{locale}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground">No locales configured. Click &quot;Configure Languages&quot; to get started.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
