import { getAdminClient } from './supabase';
import type { DashboardUser, ManagedUser } from './types';

function mapUsers(data: any[]): ManagedUser[] {
  const users = (data ?? []) as ManagedUser[];
  const nameMap = new Map(users.map((user) => [user.id, user.display_name || user.username]));
  return users.map((user) => ({
    ...user,
    manager_name: user.manager_user_id ? nameMap.get(user.manager_user_id) || null : null,
    approved_by_name: (user as any).approved_by ? nameMap.get((user as any).approved_by) || null : null
  }));
}

export async function getManagedUsers() {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, username, display_name, role, approval_status, manager_user_id, approved_at, created_at, approved_by')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return mapUsers(data ?? []);
}

export async function getApprovedPros() {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, username, display_name, role, approval_status, manager_user_id, approved_at, created_at')
    .eq('role', 'pro')
    .eq('approval_status', 'approved')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as DashboardUser[];
}

export function getTeamOwnerId(user: DashboardUser) {
  if (user.role === 'master') return null;
  if (user.role === 'pro') return user.id;
  return user.manager_user_id || null;
}

export function canManageUser(currentUser: DashboardUser, target: ManagedUser) {
  if (currentUser.role === 'master') return target.role !== 'master';
  return false;
}
