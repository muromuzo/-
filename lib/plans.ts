import { getAdminClient } from './supabase';
import type { MonthlyPlanRecord } from './types';

const planSelect = `
  id, brand_name, month_label, plan_memo, created_by, created_at,
  plan_items(title, note)
`;

export async function getPlans() {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('monthly_plan_pages')
    .select(planSelect)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as MonthlyPlanRecord[];
}

export async function getRecentPlans(limit = 10) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('monthly_plan_pages')
    .select(planSelect)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as MonthlyPlanRecord[];
}

export async function getPlanById(id: string) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('monthly_plan_pages')
    .select(planSelect)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as MonthlyPlanRecord;
}
