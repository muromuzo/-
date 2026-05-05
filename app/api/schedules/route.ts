import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getVisibleScheduleMemos } from '@/lib/schedules';
import { getAdminClient } from '@/lib/supabase';
import { getTeamOwnerId } from '@/lib/users';

export const runtime = 'nodejs';

function resolveOwnerProId(currentUser: Awaited<ReturnType<typeof getCurrentUser>>, requestedOwnerProId?: string) {
  if (!currentUser) return null;
  if (currentUser.role === 'master') return requestedOwnerProId || null;
  if (currentUser.role === 'pro') return currentUser.id;
  return currentUser.manager_user_id || null;
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
    const ownerProId = resolveOwnerProId(user, String(payload.ownerProId || ''));

    if (!scheduledDate || !title) return NextResponse.json({ error: '날짜와 제목은 필수입니다.' }, { status: 400 });
    if (!ownerProId) return NextResponse.json({ error: '공유할 프로 팀을 지정해 주세요.' }, { status: 400 });

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('team_schedule_memos')
      .insert({ owner_pro_id: ownerProId, scheduled_date: scheduledDate, category, title, note, created_by: user.id })
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
