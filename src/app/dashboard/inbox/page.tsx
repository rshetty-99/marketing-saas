import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { generateMockInboxItems } from '@/lib/inbox/inbox-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Reply, Archive, Clock } from 'lucide-react';

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-pink-500', linkedin: 'bg-blue-600', facebook: 'bg-blue-500',
  twitter: 'bg-sky-500', youtube: 'bg-red-500', tiktok: 'bg-black',
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: 'text-green-500', neutral: 'text-muted-foreground', negative: 'text-red-500',
};

export default async function InboxPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');

  const items = generateMockInboxItems();

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList><BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator className="hidden md:block" /><BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Inbox</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="inbox-page">
        <div className="flex items-center justify-between">
          <h1 className="text-heading-xl font-display text-foreground">Unified Inbox</h1>
          <Badge variant="outline">{items.length} messages</Badge>
        </div>

        <div className="space-y-2" data-testid="inbox-items">
          {items.map((item) => (
            <Card key={item.id as string}>
              <CardContent className="flex items-center gap-4 py-3">
                <div className={`size-2.5 rounded-full ${PLATFORM_COLORS[item.platform as string] ?? 'bg-muted'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-ui text-sm font-medium">{item.authorHandle as string}</span>
                    <Badge variant="outline" className="text-[10px]">{item.type as string}</Badge>
                    <Badge variant="outline" className="text-[10px]">{item.platform as string}</Badge>
                    <span className={`text-[10px] ${SENTIMENT_COLORS[item.sentiment as string] ?? ''}`}>{item.sentiment as string}</span>
                  </div>
                  <p className="text-body-sm text-muted-foreground truncate mt-0.5">{item.content as string}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm"><Reply className="size-3.5" /></Button>
                  <Button variant="ghost" size="icon-sm"><Clock className="size-3.5" /></Button>
                  <Button variant="ghost" size="icon-sm"><Archive className="size-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
