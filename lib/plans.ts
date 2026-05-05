import { getAdminClient } from './supabase';
import type { MonthlyPlanRecord } from './types';

export async function getPlans() {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('monthly_plan_pages')
    .select(`
      id, brand_name, month_label, plan_memo, created_by, created_at,
      plan_items(title, note)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as MonthlyPlanRecord[];
}

export async function getPlanById(id: string) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('monthly_plan_pages')
    .select(`
      id, brand_name, month_label, plan_memo, created_by, created_at,
      plan_items(title, note)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as MonthlyPlanRecord;
}
