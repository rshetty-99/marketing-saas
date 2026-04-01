import { PlatformTeamTable } from '@/components/features/F0/admin/PlatformTeamTable';
import { CreatePlatformUserForm } from '@/components/features/F0/admin/CreatePlatformUserForm';
import { Separator } from '@/components/ui/separator';

export default async function AdminTeamPage() {
  return (
    <div className="flex flex-col gap-8">
      <PlatformTeamTable />
      <Separator />
      <CreatePlatformUserForm />
    </div>
  );
}
