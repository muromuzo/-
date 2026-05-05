import DashboardClient from '@/components/DashboardClient';
import { requireUser } from '@/lib/auth';
import { ensureMasterUser } from '@/lib/master-seed';
import { getBoardPosts } from '@/lib/boards';
import { getPlans } from '@/lib/plans';
import { getReports } from '@/lib/reports';
import { getCurrentWeekMemos, getVisibleScheduleMemos } from '@/lib/schedules';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await ensureMasterUser();
  const user = await requireUser();
  const [reports, plans, recentPosts, allSchedules] = await Promise.all([
    getReports(),
    getPlans(),
    getBoardPosts(5),
    getVisibleScheduleMemos(user)
  ]);

  return (
    <DashboardClient
      user={user}
      recentReports={reports.slice(0, 10)}
      recentPlans={plans.slice(0, 10)}
      recentPosts={recentPosts}
      weeklySchedules={getCurrentWeekMemos(allSchedules)}
    />
  );
}
