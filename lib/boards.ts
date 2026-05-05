import { getAdminClient } from './supabase';
import type { BoardPost, DashboardUser } from './types';

export async function getBoardPosts(limit?: number) {
  const supabase = getAdminClient();
  let query = supabase
    .from('board_posts')
    .select('id, title, content, created_by, created_at')
    .order('created_at', { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;

  const posts = (data ?? []) as Array<{ id: string; title: string; content: string; created_by: string; created_at: string }>;
  const userIds = [...new Set(posts.map((post) => post.created_by))];
  const userMap = new Map<string, DashboardUser>();

  if (userIds.length) {
    const { data: users } = await supabase
      .from('users')
      .select('id, username, display_name, contact_name, role, approval_status, manager_user_id, approved_at, created_at')
      .in('id', userIds);

    for (const user of (users ?? []) as DashboardUser[]) {
      userMap.set(user.id, user);
    }
  }

  return posts.map((post) => {
    const author = userMap.get(post.created_by);
    return {
      ...post,
      author_name: author?.display_name || author?.contact_name || author?.username || '알 수 없음',
      author_role: author?.role || 'general'
    } satisfies BoardPost;
  });
}

export async function getBoardPostById(id: string) {
  const posts = await getBoardPosts();
  const found = posts.find((post) => post.id === id);
  if (!found) throw new Error('게시글을 찾을 수 없습니다.');
  return found;
}
