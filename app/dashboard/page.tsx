import DashboardClient from '@/components/DashboardClient';
import { requireUser } from '@/lib/auth';
import { getBoardPosts } from '@/lib/boards';
import { ensureMasterUser } from '@/lib/master-seed';
import { getRecentPlans } from '@/lib/plans';
import { getRecentReports } from '@/lib/reports';
import { getCurrentWeekVisibleScheduleMemos } from '@/lib/schedules';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await ensureMasterUser();
  const user = await requireUser();
  const [reports, plans, recentPosts, weeklySchedules] = await Promise.all([
    getRecentReports(10),
    getRecentPlans(10),
    getBoardPosts(5),
    getCurrentWeekVisibleScheduleMemos(user)
  ]);

  return (
    <DashboardClient
      user={user}
      recentReports={reports}
      recentPlans={plans}
      recentPosts={recentPosts}
      weeklySchedules={weeklySchedules}
    />
  );
}
