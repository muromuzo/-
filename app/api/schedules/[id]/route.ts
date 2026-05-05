import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getVisibleScheduleMemos } from '@/lib/schedules';
import { getAdminClient } from '@/lib/supabase';

export const runtime = 'nodejs';

async function getScheduleForAccess(id: string) {
  const supabase = getAdminClient();
  const { data } = await supabase
    .from('team_schedule_memos')
    .select('id, owner_pro_id, created_by')
    .eq('id', id)
    .maybeSingle();
  return data as { id: string; owner_pro_id: string; created_by: string } | null;
}

function canAccessMemo(user: Awaited<ReturnType<typeof getCurrentUser>>, memo: { owner_pro_id: string; created_by: string } | null) {
  if (!user || !memo) return false;
  if (user.role === 'master') return true;
  if (user.role === 'pro') return memo.owner_pro_id === user.id;
  return memo.owner_pro_id === user.manager_user_id;
}

function resolveOwnerProId(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>, requestedOwnerProId?: string) {
  if (user.role === 'master') return requestedOwnerProId || null;
  if (user.role === 'pro') return user.id;
  return user.manager_user_id || null;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.approval_status !== 'approved') return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    const { id } = await params;
    const memo = await getScheduleForAccess(id);
    if (!canAccessMemo(user, memo)) return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });

    const payload = await request.json();
    const scheduledDate = String(payload.scheduledDate || '');
    const category = String(payload.category || '').trim() || '운영';
    const title = String(payload.title || '').trim();
    const note = String(payload.note || '').trim();
    const isChecked = Boolean(payload.isChecked);
    const ownerProId = resolveOwnerProId(user, String(payload.ownerProId || memo?.owner_pro_id || ''));

    if (!scheduledDate || !title || !ownerProId) {
      return NextResponse.json({ error: '날짜, 제목, 공유 팀은 필수입니다.' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { error } = await supabase
      .from('team_schedule_memos')
      .update({ scheduled_date: scheduledDate, category, title, note, is_checked: isChecked, owner_pro_id: ownerProId })
      .eq('id', id);
    if (error) return NextResponse.json({ error: '일정 메모 수정에 실패했습니다.' }, { status: 500 });

    const memos = await getVisibleScheduleMemos(user);
    const updated = memos.find((item) => item.id === id);
    return NextResponse.json({ ok: true, memo: updated });
  } catch {
    return NextResponse.json({ error: '일정 메모 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.approval_status !== 'approved') return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    const { id } = await params;
    const memo = await getScheduleForAccess(id);
    if (!canAccessMemo(user, memo)) return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });

    const supabase = getAdminClient();
    const { error } = await supabase.from('team_schedule_memos').delete().eq('id', id);
    if (error) return NextResponse.json({ error: '일정 메모 삭제에 실패했습니다.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '일정 메모 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
