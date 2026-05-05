import { NextResponse } from 'next/server';
import { getCurrentUser, isWriterRole } from '@/lib/auth';
import { getBoardPostById } from '@/lib/boards';
import { getAdminClient } from '@/lib/supabase';

export const runtime = 'nodejs';

async function canEditBoardPost(userId: string, role: string, postId: string) {
  if (role === 'master') return true;
  if (!isWriterRole(role as any)) return false;
  const supabase = getAdminClient();
  const { data } = await supabase.from('board_posts').select('created_by').eq('id', postId).maybeSingle();
  return data?.created_by === userId;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.approval_status !== 'approved') return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    const { id } = await params;
    const allowed = await canEditBoardPost(user.id, user.role, id);
    if (!allowed) return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });

    const payload = await request.json();
    const title = String(payload.title || '').trim();
    const content = String(payload.content || '').trim();
    if (!title || !content) return NextResponse.json({ error: '제목과 내용을 입력해 주세요.' }, { status: 400 });

    const supabase = getAdminClient();
    const { error } = await supabase.from('board_posts').update({ title, content }).eq('id', id);
    if (error) return NextResponse.json({ error: '게시글 수정에 실패했습니다.' }, { status: 500 });
    const post = await getBoardPostById(id);
    return NextResponse.json({ ok: true, post });
  } catch {
    return NextResponse.json({ error: '게시글 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.approval_status !== 'approved') return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    const { id } = await params;
    const allowed = await canEditBoardPost(user.id, user.role, id);
    if (!allowed) return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });

    const supabase = getAdminClient();
    const { error } = await supabase.from('board_posts').delete().eq('id', id);
    if (error) return NextResponse.json({ error: '게시글 삭제에 실패했습니다.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '게시글 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
