import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.approval_status !== 'approved') {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }
    if (currentUser.role !== 'master') {
      return NextResponse.json({ error: '마스터 권한이 필요합니다.' }, { status: 403 });
    }

    const { id } = await params;
    if (id === currentUser.id) {
      return NextResponse.json({ error: '현재 로그인한 마스터 계정은 삭제할 수 없습니다.' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data: target } = await supabase.from('users').select('id').eq('id', id).maybeSingle();
    if (!target) {
      return NextResponse.json({ error: '대상 계정을 찾을 수 없습니다.' }, { status: 404 });
    }

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: '계정 삭제에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '계정 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
