import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { normalizeReportPayload } from '@/lib/report-payload';
import { getReportById } from '@/lib/reports';
import { getAdminClient } from '@/lib/supabase';

export const runtime = 'nodejs';

async function canEditReport(userId: string, role: string, reportId: string) {
  if (role === 'admin' || role === 'master') return true;
  const supabase = getAdminClient();
  const { data } = await supabase.from('monthly_reports').select('created_by').eq('id', reportId).maybeSingle();
  return data?.created_by === userId;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    const { id } = await params;
    const allowed = await canEditReport(user.id, user.role, id);
    if (!allowed) return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });

    const payload = normalizeReportPayload(await request.json());
    const supabase = getAdminClient();

    const { error } = await supabase
      .from('monthly_reports')
      .update({
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
        status_memo: payload.statusMemo
      })
      .eq('id', id);

    if (error) return NextResponse.json({ error: '보고서 수정에 실패했습니다.' }, { status: 500 });

    await supabase.from('marketing_items').delete().eq('report_id', id);
    await supabase.from('revenue_channels').delete().eq('report_id', id);
    await supabase.from('savings_items').delete().eq('report_id', id);

    if (payload.marketingItems.length) {
      await supabase.from('marketing_items').insert(payload.marketingItems.map((item: { name: string; value: number }) => ({ report_id: id, name: item.name, value: item.value })));
    }
    if (payload.savingsItems.length) {
      await supabase.from('savings_items').insert(payload.savingsItems.map((item: { name: string; value: number }) => ({ report_id: id, name: item.name, value: item.value })));
    }
    if (payload.channels.length) {
      await supabase.from('revenue_channels').insert(payload.channels.map((item: { name: string; revenue: number }) => ({ report_id: id, name: item.name, revenue: item.revenue })));
    }

    const report = await getReportById(id);
    return NextResponse.json({ ok: true, report });
  } catch {
    return NextResponse.json({ error: '보고서 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    const { id } = await params;
    const allowed = await canEditReport(user.id, user.role, id);
    if (!allowed) return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });

    const supabase = getAdminClient();
    await supabase.from('marketing_items').delete().eq('report_id', id);
    await supabase.from('revenue_channels').delete().eq('report_id', id);
    await supabase.from('savings_items').delete().eq('report_id', id);
    await supabase.from('monthly_reports').delete().eq('id', id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '보고서 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
