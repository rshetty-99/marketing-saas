import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, Search } from 'lucide-react';

export default async function StockPhotosPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'content.view');
  if (!canView) redirect('/dashboard');

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList>
          <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Stock Photos</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="stock-photos-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl font-display text-foreground">Stock Photos</h1>
            <p className="text-body-sm text-muted-foreground mt-1">Search Unsplash, Pexels, and Pixabay for royalty-free images.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">Unsplash</Badge>
          <Badge variant="outline">Pexels</Badge>
          <Badge variant="outline">Pixabay</Badge>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Search className="size-5 text-muted-foreground" />
              <div className="w-full max-w-md">
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground" data-testid="stock-search-placeholder">
                  Search millions of royalty-free images...
                </div>
              </div>
            </div>
            <ImageIcon className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-body-sm text-muted-foreground">Enter a search term to browse stock photos from Unsplash, Pexels, and Pixabay.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
