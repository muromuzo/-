import DashboardClient from '@/components/DashboardClient';
import { requireUser } from '@/lib/auth';
import { ensureMasterUser } from '@/lib/master-seed';
import { getReports } from '@/lib/reports';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await ensureMasterUser();
  const user = await requireUser();
  const reports = await getReports();

  return <DashboardClient user={user} initialReports={reports} />;
}
