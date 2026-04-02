import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listImages } from '@/lib/f13/image-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ImagesPageClient } from './images-client';

export default async function ImagesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canGenerate = await hasPermission('workspace', result.member.role, 'images.generate');
  if (!canGenerate) redirect('/dashboard');

  const images = await listImages(result.workspaceId, { limit: 50 });

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList><BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator className="hidden md:block" /><BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Images</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6">
        <ImagesPageClient
          images={images.map((img) => ({
            id: img.id as string,
            prompt: (img.generationParams as Record<string, unknown>)?.prompt as string ?? '',
            storageUrl: img.storageUrl as string,
            thumbnailUrl: img.thumbnailUrl as string,
            width: img.width as number,
            height: img.height as number,
            stylePreset: (img.generationParams as Record<string, unknown>)?.stylePreset as string ?? '',
            createdAt: (img.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? '',
          }))}
        />
      </div>
    </>
  );
}
