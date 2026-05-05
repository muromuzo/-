import PlansClient from '@/components/PlansClient';
import { requireUser } from '@/lib/auth';
import { ensureMasterUser } from '@/lib/master-seed';
import { getPlans } from '@/lib/plans';

export const dynamic = 'force-dynamic';

export default async function PlansPage() {
  await ensureMasterUser();
  const user = await requireUser();
  const plans = await getPlans();

  return <PlansClient user={user} initialPlans={plans} />;
}
