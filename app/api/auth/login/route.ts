import { NextResponse } from 'next/server';
import { verifyPassword, setSessionCookie } from '@/lib/auth';
import { ensureMasterUser } from '@/lib/master-seed';
import { getAdminClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    await ensureMasterUser();
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: '아이디와 비밀번호를 입력해 주세요.' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password_hash, role')
      .eq('username', username)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({ error: '존재하지 않는 계정입니다.' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password_hash as string);
    if (!isValid) {
      return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    await setSessionCookie({ userId: user.id as string, username: user.username as string, role: user.role as any });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: '로그인 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
