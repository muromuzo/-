import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPlanById } from '@/lib/plans';
import { getAdminClient } from '@/lib/supabase';

export const runtime = 'nodejs';

type PlanInput = { title?: string; note?: string };

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

    const payload = await request.json();
    const brandName = String(payload.brandName || '').trim();
    const monthLabel = String(payload.monthLabel || '').trim();
    const planMemo = String(payload.planMemo || '');
    const items = Array.isArray(payload.items)
      ? payload.items
          .map((item: PlanInput) => ({ title: String(item.title || '').trim(), note: String(item.note || '') }))
          .filter((item: { title: string; note: string }) => item.title || item.note)
      : [];

    if (!brandName || !monthLabel) {
      return NextResponse.json({ error: '브랜드명과 기준 월은 필수입니다.' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('monthly_plan_pages')
      .insert({
        brand_name: brandName,
        month_label: monthLabel,
        plan_memo: planMemo,
        created_by: user.id
      })
      .select('id')
      .single();

    if (error) return NextResponse.json({ error: '계획서 저장에 실패했습니다.' }, { status: 500 });

    const planId = data.id as string;
    if (items.length) {
      await supabase.from('plan_items').insert(items.map((item: { title: string; note: string }) => ({ plan_id: planId, title: item.title, note: item.note })));
    }

    const plan = await getPlanById(planId);
    return NextResponse.json({ ok: true, plan });
  } catch {
    return NextResponse.json({ error: '계획서 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
