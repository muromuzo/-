import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { normalizeReportPayload } from '@/lib/report-payload';
import { getReportById } from '@/lib/reports';
import { getAdminClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    const payload = normalizeReportPayload(await request.json());

    if (!payload.brandName || !payload.monthLabel) {
      return NextResponse.json({ error: '브랜드명과 기준 월은 필수입니다.' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('monthly_reports')
      .insert({
        brand_name: payload.brandName,
        month_label: payload.monthLabel,
        gross_revenue: payload.grossRevenue,
        revenue_deduction: payload.revenueDeduction,
        adjusted_revenue: payload.adjustedRevenue,
        baseline_revenue: payload.baselineRevenue,
        increase_amount: payload.increaseAmount,
        growth_rate: payload.growthRate,
        fee_rate: payload.feeRate,
        supply_increase: payload.supplyIncrease,
        fee_amount: payload.feeAmount,
        manager_note: payload.managerNote,
        other_note: payload.otherNote,
        status_memo: payload.statusMemo,
        created_by: user.id
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: '보고서 저장에 실패했습니다.' }, { status: 500 });
    }

    const reportId = data.id as string;
    if (payload.marketingItems.length) {
      await supabase.from('marketing_items').insert(payload.marketingItems.map((item: { name: string; value: number }) => ({ report_id: reportId, name: item.name, value: item.value })));
    }
    if (payload.channels.length) {
      await supabase.from('revenue_channels').insert(payload.channels.map((item: { name: string; revenue: number }) => ({ report_id: reportId, name: item.name, revenue: item.revenue })));
    }

    const report = await getReportById(reportId);
    return NextResponse.json({ ok: true, report });
  } catch {
    return NextResponse.json({ error: '보고서 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
