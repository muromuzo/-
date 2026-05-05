import BoardClient from '@/components/BoardClient';
import { requireUser } from '@/lib/auth';
import { ensureMasterUser } from '@/lib/master-seed';
import { getBoardPosts } from '@/lib/boards';

export const dynamic = 'force-dynamic';

export default async function BoardPage() {
  await ensureMasterUser();
  const user = await requireUser();
  const posts = await getBoardPosts();

  return <BoardClient user={user} initialPosts={posts} />;
}
