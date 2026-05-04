import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    if (!['admin', 'master'].includes(currentUser.role)) return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    const { role } = await request.json();
    const { id } = await params;

    if (!['admin', 'user'].includes(role)) {
      return NextResponse.json({ error: '변경 가능한 권한은 admin 또는 user 입니다.' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data: target } = await supabase.from('users').select('role').eq('id', id).maybeSingle();
    if (target?.role === 'master') {
      return NextResponse.json({ error: 'master 권한은 변경할 수 없습니다.' }, { status: 403 });
    }

    const { error } = await supabase.from('users').update({ role }).eq('id', id);
    if (error) {
      return NextResponse.json({ error: '권한 변경에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '권한 변경 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
