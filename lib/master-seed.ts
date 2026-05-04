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

  if (existing?.id) return existing.id;

  const passwordHash = await hashPassword(masterPassword);
  const { data, error } = await supabase
    .from('users')
    .insert({
      username: masterUsername,
      display_name: displayName,
      password_hash: passwordHash,
      role: 'master'
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}
