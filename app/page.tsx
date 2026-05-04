import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ensureMasterUser } from '@/lib/master-seed';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  await ensureMasterUser();
  const user = await getCurrentUser();
  redirect(user ? '/dashboard' : '/login');
}
