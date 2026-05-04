import { NextResponse } from 'next/server';
import { hashPassword, setSessionCookie } from '@/lib/auth';
import { ensureMasterUser } from '@/lib/master-seed';
import { getAdminClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    await ensureMasterUser();
    const { username, password, displayName } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: '아이디와 비밀번호를 입력해 주세요.' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data: existing } = await supabase.from('users').select('id').eq('username', username).maybeSingle();
    if (existing?.id) {
      return NextResponse.json({ error: '이미 사용 중인 아이디입니다.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const { data, error } = await supabase
      .from('users')
      .insert({ username, display_name: displayName || null, password_hash: passwordHash, role: 'user' })
      .select('id, username, role')
      .single();

    if (error) {
      return NextResponse.json({ error: '회원가입에 실패했습니다.' }, { status: 500 });
    }

    await setSessionCookie({ userId: data.id as string, username: data.username as string, role: data.role as any });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '회원가입 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
