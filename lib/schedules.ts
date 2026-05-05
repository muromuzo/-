import { getAdminClient } from './supabase';
import type { DashboardUser, ScheduleMemo } from './types';
import { getTeamOwnerId } from './users';

function enrichScheduleMemos(rawMemos: Array<{
  id: string;
  owner_pro_id: string;
  scheduled_date: string;
  category: string;
  title: string;
  note: string | null;
  is_checked: boolean;
  created_by: string;
  created_at: string;
}>) {
  return async () => {
    const supabase = getAdminClient();
    const userIds = [...new Set(rawMemos.flatMap((memo) => [memo.created_by, memo.owner_pro_id]))];
    const userMap = new Map<string, DashboardUser>();

    if (userIds.length) {
      const { data: users } = await supabase
        .from('users')
        .select('id, username, display_name, role, approval_status, manager_user_id, approved_at, created_at')
        .in('id', userIds);
      for (const userRow of (users ?? []) as DashboardUser[]) {
        userMap.set(userRow.id, userRow);
      }
    }

    return rawMemos.map((memo) => ({
      ...memo,
      author_name: userMap.get(memo.created_by)?.display_name || userMap.get(memo.created_by)?.username || '알 수 없음',
      owner_pro_name: userMap.get(memo.owner_pro_id)?.display_name || userMap.get(memo.owner_pro_id)?.username || '미지정'
    } satisfies ScheduleMemo));
  };
}

export async function getVisibleScheduleMemos(user: DashboardUser) {
  const supabase = getAdminClient();
  let query = supabase
    .from('team_schedule_memos')
    .select('id, owner_pro_id, scheduled_date, category, title, note, is_checked, created_by, created_at')
    .order('scheduled_date', { ascending: true })
    .order('created_at', { ascending: false });

  const teamOwnerId = getTeamOwnerId(user);
  if (teamOwnerId) query = query.eq('owner_pro_id', teamOwnerId);

  const { data, error } = await query;
  if (error) throw error;

  const memos = (data ?? []) as Array<{
    id: string;
    owner_pro_id: string;
    scheduled_date: string;
    category: string;
    title: string;
    note: string | null;
    is_checked: boolean;
    created_by: string;
    created_at: string;
  }>;

  return enrichScheduleMemos(memos)();
}

export async function getCurrentWeekVisibleScheduleMemos(user: DashboardUser) {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() + mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const startDate = start.toISOString().slice(0, 10);
  const endDate = end.toISOString().slice(0, 10);

  const supabase = getAdminClient();
  let query = supabase
    .from('team_schedule_memos')
    .select('id, owner_pro_id, scheduled_date, category, title, note, is_checked, created_by, created_at')
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate)
    .order('scheduled_date', { ascending: true })
    .order('created_at', { ascending: false });

  const teamOwnerId = getTeamOwnerId(user);
  if (teamOwnerId) query = query.eq('owner_pro_id', teamOwnerId);

  const { data, error } = await query;
  if (error) throw error;

  const memos = (data ?? []) as Array<{
    id: string;
    owner_pro_id: string;
    scheduled_date: string;
    category: string;
    title: string;
    note: string | null;
    is_checked: boolean;
    created_by: string;
    created_at: string;
  }>;

  return enrichScheduleMemos(memos)();
}

export function getCurrentWeekMemos(memos: ScheduleMemo[]) {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() + mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return memos.filter((memo) => {
    const date = new Date(`${memo.scheduled_date}T00:00:00`);
    return date >= start && date <= end;
  });
}
