'use client';

import { useState } from 'react';
import AppTabs from '@/components/AppTabs';
import type { BoardPost, DashboardUser } from '@/lib/types';

type Props = {
  user: DashboardUser;
  initialPosts: BoardPost[];
};

const canWrite = (role: DashboardUser['role']) => role === 'master' || role === 'pro';

export default function BoardClient({ user, initialPosts }: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setContent('');
    setError('');
  }

  function loadPost(post: BoardPost) {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSave() {
    setLoading(true);
    setError('');
    try {
      const endpoint = editingId ? `/api/board/${editingId}` : '/api/board';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '게시글 저장에 실패했습니다.');
      setPosts((prev) => editingId ? prev.map((post) => (post.id === data.post.id ? data.post : post)) : [data.post, ...prev]);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 게시글을 삭제할까요?')) return;
    const res = await fetch(`/api/board/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || '삭제에 실패했습니다.');
      return;
    }
    setPosts((prev) => prev.filter((post) => post.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <div className="container">
      <AppTabs user={user} active="board" description="프로 이상 계정이 공지와 운영 노하우를 남길 수 있는 사내 게시판입니다. 대시보드에는 최신 5개 제목만 노출됩니다." />

      {canWrite(user.role) && (
        <section className="panel">
          <h2>{editingId ? '게시글 수정' : '새 글 작성'}</h2>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>제목</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 5월 병원 운영 공지" />
          </div>
          <div className="field">
            <label>내용</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="공지 내용, 가이드, 참고 링크 등을 자유롭게 작성하세요." style={{ minHeight: 180 }} />
          </div>
          {error && <div style={{ marginTop: 12, color: 'var(--red)', fontWeight: 800 }}>{error}</div>}
          <div className="toolbar mt">
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading ? '저장 중...' : editingId ? '수정 저장' : '게시글 등록'}</button>
            <button className="btn btn-light" onClick={resetForm}>초기화</button>
          </div>
        </section>
      )}

      <section className="panel">
        <div className="section-title">
          <h2>사내 게시판</h2>
          <span className="muted small">최신 글이 위로 정렬됩니다.</span>
        </div>
        {!posts.length && <div className="empty">아직 등록된 게시글이 없습니다.</div>}
        <div className="card-list">
          {posts.map((post) => {
            const canEdit = user.role === 'master' || (canWrite(user.role) && user.id === post.created_by);
            return (
              <article className="report-card" key={post.id}>
                <div className="report-card-head">
                  <div>
                    <div className="title-lg" style={{ fontSize: 22 }}>{post.title}</div>
                    <div className="title-sm">{post.author_name} · {new Date(post.created_at).toLocaleString('ko-KR')}</div>
                  </div>
                  {canEdit && (
                    <div className="toolbar">
                      <button className="btn btn-light" onClick={() => loadPost(post)}>수정</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(post.id)}>삭제</button>
                    </div>
                  )}
                </div>
                <div className="report-card-body">
                  <div className="board-content" style={{ whiteSpace: 'pre-line' }}>{post.content}</div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
