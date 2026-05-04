import UsersAdmin from '@/components/UsersAdmin';
import { requireAdmin } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const user = await requireAdmin();
  const supabase = getAdminClient();
  const { data } = await supabase
    .from('users')
    .select('id, username, display_name, role, created_at')
    .order('created_at', { ascending: true });

  return <UsersAdmin currentUser={user} initialUsers={(data ?? []) as any} />;
}
