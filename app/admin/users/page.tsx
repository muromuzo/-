import UsersAdmin from '@/components/UsersAdmin';
import { requireMaster } from '@/lib/auth';
import { getApprovedPros, getManagedUsers } from '@/lib/users';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const user = await requireMaster();
  const users = await getManagedUsers();
  const pros = await getApprovedPros();

  return <UsersAdmin currentUser={user} initialUsers={users} proOptions={pros} />;
}
