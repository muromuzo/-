export type UserRole = 'master' | 'admin' | 'user';

export type DashboardUser = {
  id: string;
  username: string;
  display_name: string | null;
  role: UserRole;
  created_at: string;
};

export type MarketingItem = {
  name: string;
  value: number;
};

export type RevenueChannel = {
  name: string;
  revenue: number;
};

export type ReportRecord = {
  id: string;
  brand_name: string;
  month_label: string;
  gross_revenue: number;
  revenue_deduction: number;
  adjusted_revenue: number;
  baseline_revenue: number;
  increase_amount: number;
  growth_rate: number;
  fee_rate: number;
  supply_increase: number;
  fee_amount: number;
  manager_note: string | null;
  other_note: string | null;
  status_memo: string | null;
  created_by: string;
  created_at: string;
  marketing_items: MarketingItem[];
  revenue_channels: RevenueChannel[];
};
