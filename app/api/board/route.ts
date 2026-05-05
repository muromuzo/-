import { NextResponse } from 'next/server';
import { getCurrentUser, isWriterRole } from '@/lib/auth';
import { getBoardPostById } from '@/lib/boards';
import { getAdminClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.approval_status !== 'approved') return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    if (!isWriterRole(user.role)) return NextResponse.json({ error: '프로 이상 권한만 게시글을 작성할 수 있습니다.' }, { status: 403 });

    const payload = await request.json();
    const title = String(payload.title || '').trim();
    const content = String(payload.content || '').trim();
    if (!title || !content) return NextResponse.json({ error: '제목과 내용을 입력해 주세요.' }, { status: 400 });

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('board_posts')
      .insert({ title, content, created_by: user.id })
      .select('id')
      .single();

    if (error) return NextResponse.json({ error: '게시글 등록에 실패했습니다.' }, { status: 500 });
    const post = await getBoardPostById(data.id as string);
    return NextResponse.json({ ok: true, post });
  } catch {
    return NextResponse.json({ error: '게시글 등록 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
