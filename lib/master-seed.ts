import { getAdminClient } from './supabase';
import { hashPassword } from './auth';

let masterCheckCache: { userId: string; checkedAt: number } | null = null;
const MASTER_CACHE_MS = 1000 * 60 * 10;

export async function ensureMasterUser() {
  if (masterCheckCache && Date.now() - masterCheckCache.checkedAt < MASTER_CACHE_MS) {
    return masterCheckCache.userId;
  }

  const supabase = getAdminClient();
  const masterUsername = process.env.MASTER_USERNAME || 'polabs';
  const masterPassword = process.env.MASTER_PASSWORD || 'vldhfoqtm1!';
  const displayName = process.env.MASTER_DISPLAY_NAME || 'PO LABS MASTER';

  const { data: existing } = await supabase
    .from('users')
    .select('id, role, approval_status, manager_user_id')
    .eq('username', masterUsername)
    .maybeSingle();

  if (existing?.id) {
    if (
      existing.role !== 'master'
      || existing.approval_status !== 'approved'
      || existing.manager_user_id !== null
    ) {
      await supabase
        .from('users')
        .update({ role: 'master', approval_status: 'approved', manager_user_id: null, contact_name: displayName })
        .eq('id', existing.id);
    }

    masterCheckCache = { userId: existing.id, checkedAt: Date.now() };
    return existing.id;
  }

  const passwordHash = await hashPassword(masterPassword);
  const { data, error } = await supabase
    .from('users')
    .insert({
      username: masterUsername,
      display_name: displayName,
      contact_name: displayName,
      password_hash: passwordHash,
      role: 'master',
      approval_status: 'approved',
      approved_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (error) throw error;
  masterCheckCache = { userId: data.id as string, checkedAt: Date.now() };
  return data.id as string;
}
