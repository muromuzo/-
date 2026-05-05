import DashboardClient from '@/components/DashboardClient';
import { requireUser } from '@/lib/auth';
import { ensureMasterUser } from '@/lib/master-seed';
import { getReports } from '@/lib/reports';
import { getBoardPosts } from '@/lib/boards';
import { getCurrentWeekMemos, getVisibleScheduleMemos } from '@/lib/schedules';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await ensureMasterUser();
  const user = await requireUser();
  const [reports, recentPosts, allSchedules] = await Promise.all([
    getReports(),
    getBoardPosts(5),
    getVisibleScheduleMemos(user)
  ]);

  return <DashboardClient user={user} initialReports={reports} recentPosts={recentPosts} weeklySchedules={getCurrentWeekMemos(allSchedules)} />;
}
