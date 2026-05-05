import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPlanById } from '@/lib/plans';
import { getAdminClient } from '@/lib/supabase';

export const runtime = 'nodejs';

type PlanInput = { title?: string; note?: string };

async function canEditPlan(userId: string, role: string, planId: string) {
  if (role === 'admin' || role === 'master') return true;
  const supabase = getAdminClient();
  const { data } = await supabase.from('monthly_plan_pages').select('created_by').eq('id', planId).maybeSingle();
  return data?.created_by === userId;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    const { id } = await params;
    const allowed = await canEditPlan(user.id, user.role, id);
    if (!allowed) return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });

    const payload = await request.json();
    const brandName = String(payload.brandName || '').trim();
    const monthLabel = String(payload.monthLabel || '').trim();
    const planMemo = String(payload.planMemo || '');
    const items = Array.isArray(payload.items)
      ? payload.items
          .map((item: PlanInput) => ({ title: String(item.title || '').trim(), note: String(item.note || '') }))
          .filter((item: { title: string; note: string }) => item.title || item.note)
      : [];

    const supabase = getAdminClient();
    const { error } = await supabase
      .from('monthly_plan_pages')
      .update({ brand_name: brandName, month_label: monthLabel, plan_memo: planMemo })
      .eq('id', id);

    if (error) return NextResponse.json({ error: '계획서 수정에 실패했습니다.' }, { status: 500 });

    await supabase.from('plan_items').delete().eq('plan_id', id);
    if (items.length) {
      await supabase.from('plan_items').insert(items.map((item: { title: string; note: string }) => ({ plan_id: id, title: item.title, note: item.note })));
    }

    const plan = await getPlanById(id);
    return NextResponse.json({ ok: true, plan });
  } catch {
    return NextResponse.json({ error: '계획서 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    const { id } = await params;
    const allowed = await canEditPlan(user.id, user.role, id);
    if (!allowed) return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });

    const supabase = getAdminClient();
    await supabase.from('plan_items').delete().eq('plan_id', id);
    await supabase.from('monthly_plan_pages').delete().eq('id', id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '계획서 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
