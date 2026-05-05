import { getAdminClient } from './supabase';
import { hashPassword } from './auth';

export async function ensureMasterUser() {
  const supabase = getAdminClient();
  const masterUsername = process.env.MASTER_USERNAME || 'polabs';
  const masterPassword = process.env.MASTER_PASSWORD || 'vldhfoqtm1!';
  const displayName = process.env.MASTER_DISPLAY_NAME || 'PO LABS MASTER';

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('username', masterUsername)
    .maybeSingle();

  if (existing?.id) {
    await supabase
      .from('users')
      .update({ role: 'master', approval_status: 'approved', manager_user_id: null })
      .eq('id', existing.id);
    return existing.id;
  }

  const passwordHash = await hashPassword(masterPassword);
  const { data, error } = await supabase
    .from('users')
    .insert({
      username: masterUsername,
      display_name: displayName,
      password_hash: passwordHash,
      role: 'master',
      approval_status: 'approved',
      approved_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}
