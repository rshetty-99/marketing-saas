import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import { listAssets, listFolders } from '@/lib/f16/dam-service';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Upload, Image, FileText, Video, Music } from 'lucide-react';

const TYPE_ICONS: Record<string, React.ElementType> = {
  image: Image, video: Video, document: FileText, audio: Music, logo: Image, icon: Image,
};

export default async function AssetsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/dashboard');
  const canView = await hasPermission('workspace', result.member.role, 'dam.view_download');
  if (!canView) redirect('/dashboard');
  const canUpload = await hasPermission('workspace', result.member.role, 'dam.upload');

  const [assets, folders] = await Promise.all([
    listAssets(result.workspaceId, { limit: 50 }),
    listFolders(result.workspaceId),
  ]);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
        <Breadcrumb><BreadcrumbList><BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator className="hidden md:block" /><BreadcrumbItem><BreadcrumbPage className="font-ui text-sm">Assets</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6" data-testid="dam-page">
        <div className="flex items-center justify-between">
          <h1 className="text-heading-xl font-display text-foreground">Digital Assets</h1>
          {canUpload && <Button size="sm" data-testid="upload-asset-button"><Upload className="size-4 mr-1.5" />Upload Asset</Button>}
        </div>

        {/* Folders */}
        {folders.length > 0 && (
          <div>
            <h2 className="text-heading-md font-display text-foreground mb-3">Folders</h2>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {(folders as Record<string, unknown>[]).map((folder) => (
                <Card key={folder.id as string} className="cursor-pointer hover:border-brand-orange/50 transition-colors">
                  <CardContent className="py-4 text-center">
                    <FolderOpen className="size-8 text-brand-orange mx-auto mb-2" />
                    <p className="font-ui text-sm truncate">{folder.name as string}</p>
                    <p className="text-[10px] text-muted-foreground">{folder.assetCount as number} assets</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Assets Grid */}
        <div>
          <h2 className="text-heading-md font-display text-foreground mb-3">All Assets ({assets.length})</h2>
          {assets.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {(assets as Record<string, unknown>[]).map((asset) => {
                const Icon = TYPE_ICONS[asset.assetType as string] ?? FileText;
                return (
                  <Card key={asset.id as string} className="overflow-hidden cursor-pointer hover:border-brand-orange/50 transition-colors">
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      {asset.thumbnailUrl ? (
                        <img src={asset.thumbnailUrl as string} alt={asset.name as string} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <Icon className="size-12 text-muted-foreground opacity-30" />
                      )}
                    </div>
                    <CardContent className="py-3">
                      <p className="font-ui text-sm truncate">{asset.name as string}</p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-[10px]">{asset.assetType as string}</Badge>
                        {Number(asset.usageCount) > 0 && <Badge variant="outline" className="text-[10px]">Used {asset.usageCount as number}x</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card><CardContent className="py-12 text-center">
              <FolderOpen className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-body-sm text-muted-foreground">No assets yet. Upload your first file to get started.</p>
            </CardContent></Card>
          )}
        </div>
      </div>
    </>
  );
}
