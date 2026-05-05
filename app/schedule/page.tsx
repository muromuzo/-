import ScheduleClient from '@/components/ScheduleClient';
import { requireUser } from '@/lib/auth';
import { ensureMasterUser } from '@/lib/master-seed';
import { getVisibleScheduleMemos } from '@/lib/schedules';
import { getApprovedPros } from '@/lib/users';

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
  await ensureMasterUser();
  const user = await requireUser();
  const [memos, pros] = await Promise.all([
    getVisibleScheduleMemos(user),
    getApprovedPros()
  ]);

  return <ScheduleClient user={user} initialMemos={memos} proOptions={pros} />;
}
