import { NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.approval_status !== 'approved') {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }
    if (currentUser.role !== 'master') {
      return NextResponse.json({ error: '마스터 권한이 필요합니다.' }, { status: 403 });
    }

    const { password } = await request.json();
    const { id } = await params;

    if (!password || String(password).trim().length < 6) {
      return NextResponse.json({ error: '비밀번호는 6자 이상 입력해 주세요.' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const passwordHash = await hashPassword(String(password).trim());
    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: '비밀번호 변경에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '비밀번호 변경 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
