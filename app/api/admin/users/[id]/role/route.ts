import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase';
import { getManagedUsers } from '@/lib/users';

export const runtime = 'nodejs';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.approval_status !== 'approved') return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    if (currentUser.role !== 'master') return NextResponse.json({ error: '마스터 권한이 필요합니다.' }, { status: 403 });

    const payload = await request.json();
    const role = String(payload.role || 'general');
    const approval_status = String(payload.approval_status || 'pending');
    const manager_user_id = payload.manager_user_id ? String(payload.manager_user_id) : null;
    const display_name = String(payload.display_name || '').trim();
    const job_title = String(payload.job_title || '').trim();
    const { id } = await params;

    const supabase = getAdminClient();
    const { data: target } = await supabase.from('users').select('role').eq('id', id).maybeSingle();
    if (!target) {
      return NextResponse.json({ error: '대상 계정을 찾을 수 없습니다.' }, { status: 404 });
    }

    const isMasterTarget = target.role === 'master';

    if (!isMasterTarget && !['pro', 'general'].includes(role)) {
      return NextResponse.json({ error: '변경 가능한 권한은 pro 또는 general 입니다.' }, { status: 400 });
    }
    if (!isMasterTarget && !['pending', 'approved', 'rejected'].includes(approval_status)) {
      return NextResponse.json({ error: '승인 상태 값이 올바르지 않습니다.' }, { status: 400 });
    }

    const patch: Record<string, any> = {
      display_name: display_name || null,
      contact_name: display_name || null,
      job_title: job_title || null
    };

    if (!isMasterTarget) {
      patch.role = role;
      patch.approval_status = approval_status;
      patch.manager_user_id = role === 'general' ? manager_user_id : null;
      patch.approved_by = approval_status === 'approved' ? currentUser.id : null;
      patch.approved_at = approval_status === 'approved' ? new Date().toISOString() : null;
    }

    const { error } = await supabase.from('users').update(patch).eq('id', id);
    if (error) {
      return NextResponse.json({ error: '계정 설정 변경에 실패했습니다.' }, { status: 500 });
    }

    const users = await getManagedUsers();
    const user = users.find((item) => item.id === id);
    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ error: '계정 설정 변경 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
