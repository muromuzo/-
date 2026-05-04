import { getAdminClient } from './supabase';
import type { ReportRecord } from './types';

export async function getReports() {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('monthly_reports')
    .select(`
      id, brand_name, month_label, gross_revenue, revenue_deduction, adjusted_revenue,
      baseline_revenue, increase_amount, growth_rate, fee_rate, supply_increase,
      fee_amount, manager_note, other_note, status_memo, created_by, created_at,
      marketing_items(name, value),
      revenue_channels(name, revenue),
      savings_items(name, value)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ReportRecord[];
}

export async function getReportById(id: string) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('monthly_reports')
    .select(`
      id, brand_name, month_label, gross_revenue, revenue_deduction, adjusted_revenue,
      baseline_revenue, increase_amount, growth_rate, fee_rate, supply_increase,
      fee_amount, manager_note, other_note, status_memo, created_by, created_at,
      marketing_items(name, value),
      revenue_channels(name, revenue),
      savings_items(name, value)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as ReportRecord;
}
