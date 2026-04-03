import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { adminDb } from '@/lib/firebase/admin';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FormInput, Code } from 'lucide-react';

export default async function FormsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'leads.create');
  if (!canView) redirect('/dashboard');

  const snap = await adminDb.collection('workspaces').doc(result.workspaceId).collection('crm_forms').orderBy('createdAt', 'desc').limit(50).get();
  const forms = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Record<string, unknown>[];

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Form Builder</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="forms-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Form Builder</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Create embeddable lead capture forms for your website.</p>
          </div>
          <Button size="sm"><Plus className="size-4 mr-1.5" />New Form</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card><CardContent className="py-4 flex items-center gap-3"><FormInput className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{forms.length}</p><p className="text-xs text-muted-foreground">Forms</p></div></CardContent></Card>
          <Card><CardContent className="py-4 flex items-center gap-3"><Code className="size-8 text-brand-orange" /><div><p className="text-2xl font-display font-bold">{forms.reduce((s, f) => s + ((f.submissionCount as number) ?? 0), 0)}</p><p className="text-xs text-muted-foreground">Total Submissions</p></div></CardContent></Card>
        </div>
        {forms.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{forms.map((f) => (
            <Card key={f.id as string} className="hover:border-brand-orange/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2"><div className="flex items-start justify-between"><CardTitle className="text-heading-md font-display">{f.name as string}</CardTitle><Badge variant="outline">{(f.submissionCount as number) ?? 0} submissions</Badge></div></CardHeader>
              <CardContent>
                <div className="rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground truncate">
                  {(f.embedCode as string) || `<script src=".../${f.id as string}"></script>`}
                </div>
              </CardContent>
            </Card>
          ))}</div>
        ) : (
          <Card><CardContent className="py-12 text-center"><FormInput className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" /><p className="text-body-sm text-muted-foreground">No forms yet. Create an embeddable form to capture leads.</p></CardContent></Card>
        )}
      </div>
    </>
  );
}
