import ReportsClient from '@/components/ReportsClient';
import { requireUser } from '@/lib/auth';
import { ensureMasterUser } from '@/lib/master-seed';
import { getReports } from '@/lib/reports';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  await ensureMasterUser();
  const user = await requireUser();
  const reports = await getReports();

  return <ReportsClient user={user} initialReports={reports} />;
}
