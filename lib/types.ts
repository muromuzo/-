export type UserRole = 'master' | 'pro' | 'general';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type DashboardUser = {
  id: string;
  username: string;
  display_name: string | null;
  contact_name: string | null;
  job_title: string | null;
  role: UserRole;
  approval_status: ApprovalStatus;
  manager_user_id: string | null;
  approved_at: string | null;
  created_at: string;
};

export type ManagedUser = DashboardUser & {
  manager_name?: string | null;
  approved_by_name?: string | null;
};

export type MarketingItem = {
  name: string;
  value: number;
};

export type RevenueChannel = {
  name: string;
  revenue: number;
};

export type SavingsItem = {
  name: string;
  value: number;
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
  savings_items: SavingsItem[];
};

export type PlanItem = {
  title: string;
  note: string | null;
};

export type MonthlyPlanRecord = {
  id: string;
  brand_name: string;
  month_label: string;
  plan_memo: string | null;
  created_by: string;
  created_at: string;
  plan_items: PlanItem[];
};

export type BoardPost = {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  author_name: string;
  author_role: UserRole;
};

export type ScheduleMemo = {
  id: string;
  owner_pro_id: string | null;
  scheduled_date: string;
  category: string;
  title: string;
  note: string | null;
  is_checked: boolean;
  is_global: boolean;
  created_by: string;
  created_at: string;
  author_name: string;
  owner_pro_name: string;
};
