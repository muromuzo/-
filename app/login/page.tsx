import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { getCurrentUser } from '@/lib/auth';
import { ensureMasterUser } from '@/lib/master-seed';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  await ensureMasterUser();
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  return (
    <div className="auth-wrap">
      <AuthForm mode="login" />
    </div>
  );
}
