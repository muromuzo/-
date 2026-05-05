import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getVisibleScheduleMemos } from '@/lib/schedules';
import { getAdminClient } from '@/lib/supabase';

export const runtime = 'nodejs';

function resolveScheduleTarget(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>, requestedOwnerProId?: string, requestedGlobal?: boolean) {
  const isGlobal = Boolean(requestedGlobal) && (user.role === 'master' || user.role === 'pro');
  if (isGlobal) {
    return { ownerProId: null, isGlobal: true };
  }
  if (user.role === 'master') return { ownerProId: requestedOwnerProId || null, isGlobal: false };
  if (user.role === 'pro') return { ownerProId: user.id, isGlobal: false };
  return { ownerProId: user.manager_user_id || null, isGlobal: false };
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.approval_status !== 'approved') return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

    const payload = await request.json();
    const scheduledDate = String(payload.scheduledDate || '');
    const category = String(payload.category || '').trim() || '운영';
    const title = String(payload.title || '').trim();
    const note = String(payload.note || '').trim();
    const wantsGlobal = Boolean(payload.isGlobal);
    const { ownerProId, isGlobal } = resolveScheduleTarget(user, String(payload.ownerProId || ''), wantsGlobal);

    if (!scheduledDate || !title) return NextResponse.json({ error: '날짜와 제목은 필수입니다.' }, { status: 400 });
    if (wantsGlobal && !isGlobal) return NextResponse.json({ error: '전체 공지는 마스터 또는 프로만 등록할 수 있습니다.' }, { status: 403 });
    if (!isGlobal && !ownerProId) return NextResponse.json({ error: '공유할 프로 팀을 지정해 주세요.' }, { status: 400 });

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('team_schedule_memos')
      .insert({
        owner_pro_id: ownerProId,
        scheduled_date: scheduledDate,
        category,
        title,
        note,
        is_global: isGlobal,
        created_by: user.id
      })
      .select('id')
      .single();

    if (error) return NextResponse.json({ error: '일정 메모 저장에 실패했습니다.' }, { status: 500 });
    const memos = await getVisibleScheduleMemos(user);
    const memo = memos.find((item) => item.id === data.id);
    return NextResponse.json({ ok: true, memo });
  } catch {
    return NextResponse.json({ error: '일정 메모 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
