import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listInteractiveContent, INTERACTIVE_TEMPLATES } from '@/lib/interactive-content/interactive-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Puzzle, Calculator, ClipboardCheck, Plus } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  quiz: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  calculator: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  assessment: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

const TYPE_ICONS: Record<string, typeof Puzzle> = {
  quiz: Puzzle,
  calculator: Calculator,
  assessment: ClipboardCheck,
};

const STATUS_VARIANT: Record<string, 'default' | 'outline' | 'secondary'> = {
  draft: 'outline',
  published: 'default',
  archived: 'secondary',
};

export default async function InteractiveContentPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'content.create_edit_drafts');
  if (!canView) redirect('/dashboard');

  const content = await listInteractiveContent(result.workspaceId) as Record<string, unknown>[];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Interactive Content</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="interactive-content-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Interactive Content</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Build quizzes, calculators, and assessments that capture leads and engage your audience.</p>
          </div>
          <Button size="sm"><Plus className="size-4 mr-1.5" />Create New</Button>
        </div>

        {/* Templates Section */}
        <div>
          <h2 className="text-heading-md font-display text-foreground mb-3">Templates</h2>
          <div className="grid gap-4 md:grid-cols-3">{INTERACTIVE_TEMPLATES.map((t) => {
            const Icon = TYPE_ICONS[t.type] ?? Puzzle;
            return (
              <Card key={t.id} className="hover:border-brand-orange/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <Icon className="size-8 text-brand-orange" />
                    <Badge className={TYPE_COLORS[t.type] ?? 'bg-muted text-muted-foreground'}>{t.type}</Badge>
                  </div>
                  <CardTitle className="text-heading-md font-display mt-2">{t.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{t.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t.questions.length} questions</span>
                    <Button size="sm" variant="outline">Use Template</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}</div>
        </div>

        {/* Your Content Section */}
        <div>
          <h2 className="text-heading-md font-display text-foreground mb-3">Your Content</h2>
          {content.length > 0 ? (
            <div className="space-y-2">{content.map((c) => {
              const type = (c.type as string) ?? 'quiz';
              const status = (c.status as string) ?? 'draft';
              const views = (c.views as number) ?? 0;
              const completions = (c.completions as number) ?? 0;
              const leadsCaptures = (c.leadsCaptures as number) ?? 0;
              const hasEmbed = !!(c.embedCode as string);
              return (
                <Card key={c.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
                  <CardContent className="py-3"><div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={TYPE_COLORS[type] ?? 'bg-muted text-muted-foreground'}>{type}</Badge>
                        <Badge variant={STATUS_VARIANT[status] ?? 'outline'}>{status}</Badge>
                        {hasEmbed ? <Badge variant="outline" className="text-xs">Embed</Badge> : null}
                      </div>
                      <p className="font-ui text-sm font-medium">{c.title as string}</p>
                      <p className="text-xs text-muted-foreground truncate">{(c.description as string) ?? ''}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                      <div className="text-center"><p className="text-sm font-display font-bold text-foreground">{views}</p><p>views</p></div>
                      <div className="text-center"><p className="text-sm font-display font-bold text-foreground">{completions}</p><p>completions</p></div>
                      <div className="text-center"><p className="text-sm font-display font-bold text-foreground">{leadsCaptures}</p><p>leads</p></div>
                    </div>
                  </div></CardContent>
                </Card>
              );
            })}</div>
          ) : (
            <Card><CardContent className="py-12 text-center"><Puzzle className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground">Create your first quiz, calculator, or assessment</p></CardContent></Card>
          )}
        </div>
      </div>
    </>
  );
}
