'use client';

import { useMemo, useState } from 'react';
import AppTabs from '@/components/AppTabs';
import type { DashboardUser, ScheduleMemo } from '@/lib/types';

const DEFAULT_CATEGORIES = ['운영', '광고', '콘텐츠', '정산'];
const todayMonth = new Date().toISOString().slice(0, 7);

function teamOwnerDefault(user: DashboardUser) {
  if (user.role === 'master') return '';
  if (user.role === 'pro') return user.id;
  return user.manager_user_id || '';
}

export default function ScheduleClient({ user, initialMemos, proOptions }: { user: DashboardUser; initialMemos: ScheduleMemo[]; proOptions: DashboardUser[] }) {
  const canUseGlobal = user.role === 'master' || user.role === 'pro';
  const [memos, setMemos] = useState(initialMemos);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [category, setCategory] = useState('운영');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [ownerProId, setOwnerProId] = useState(teamOwnerDefault(user));
  const [audienceScope, setAudienceScope] = useState<'team' | 'global'>('team');
  const [monthFilter, setMonthFilter] = useState(todayMonth);
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [teamFilter, setTeamFilter] = useState('전체');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const visibleMemos = useMemo(() => {
    return memos.filter((memo) => {
      const matchesMonth = !monthFilter || memo.scheduled_date.startsWith(monthFilter);
      const matchesCategory = categoryFilter === '전체' || memo.category === categoryFilter;
      const matchesTeam = user.role !== 'master'
        ? true
        : teamFilter === '전체'
          ? true
          : teamFilter === '전체공지'
            ? memo.is_global
            : memo.owner_pro_id === teamFilter;
      return matchesMonth && matchesCategory && matchesTeam;
    });
  }, [memos, monthFilter, categoryFilter, teamFilter, user.role]);

  const categories = useMemo(() => ['전체', ...new Set([...DEFAULT_CATEGORIES, ...memos.map((memo) => memo.category).filter(Boolean)])], [memos]);
  const categorySuggestions = useMemo(() => [...new Set([...DEFAULT_CATEGORIES, ...memos.map((memo) => memo.category).filter(Boolean), category])], [memos, category]);

  const groupedMemos = useMemo(() => {
    const map = new Map<string, ScheduleMemo[]>();
    visibleMemos.forEach((memo) => {
      const key = memo.is_global ? '전체 공지' : memo.owner_pro_name || '미지정 팀';
      const bucket = map.get(key) || [];
      bucket.push(memo);
      map.set(key, bucket);
    });

    return Array.from(map.entries())
      .map(([teamName, teamMemos]) => ({
        teamName,
        memos: [...teamMemos].sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
      }))
      .sort((a, b) => a.teamName.localeCompare(b.teamName, 'ko'));
  }, [visibleMemos]);

  function resetForm() {
    setEditingId(null);
    setScheduledDate('');
    setCategory('운영');
    setTitle('');
    setNote('');
    setOwnerProId(teamOwnerDefault(user));
    setAudienceScope('team');
    setError('');
  }

  function loadMemo(memo: ScheduleMemo) {
    setEditingId(memo.id);
    setScheduledDate(memo.scheduled_date);
    setCategory(memo.category);
    setTitle(memo.title);
    setNote(memo.note || '');
    setOwnerProId(memo.owner_pro_id || teamOwnerDefault(user));
    setAudienceScope(memo.is_global ? 'global' : 'team');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSave() {
    setLoading(true);
    setError('');
    try {
      const endpoint = editingId ? `/api/schedules/${editingId}` : '/api/schedules';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledDate,
          category,
          title,
          note,
          ownerProId,
          isGlobal: audienceScope === 'global'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '일정 저장에 실패했습니다.');
      setMemos((prev) => editingId ? prev.map((memo) => (memo.id === data.memo.id ? data.memo : memo)) : [...prev, data.memo].sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date)));
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 일정 메모를 삭제할까요?')) return;
    const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || '삭제에 실패했습니다.');
      return;
    }
    setMemos((prev) => prev.filter((memo) => memo.id !== id));
    if (editingId === id) resetForm();
  }

  async function toggleCheck(memo: ScheduleMemo) {
    const res = await fetch(`/api/schedules/${memo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scheduledDate: memo.scheduled_date,
        category: memo.category,
        title: memo.title,
        note: memo.note,
        ownerProId: memo.owner_pro_id,
        isGlobal: memo.is_global,
        isChecked: !memo.is_checked
      })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || '체크 상태 변경에 실패했습니다.');
      return;
    }
    setMemos((prev) => prev.map((item) => (item.id === memo.id ? data.memo : item)));
  }

  return (
    <div className="container">
      <AppTabs user={user} active="schedule" description="팀 일정과 전체 공지를 한 번에 관리합니다. 카테고리는 직접 입력하면 새 항목으로 바로 저장되고, 마스터/프로는 전체 공지도 등록할 수 있습니다." />

      <datalist id="schedule-category-options">
        {categorySuggestions.map((item) => <option key={item} value={item} />)}
      </datalist>

      <div className="grid-2">
        <section className="panel">
          <h2>{editingId ? '일정 메모 수정' : '일정 메모 등록'}</h2>
          <div className="form-grid">
            <div className="field">
              <label>일정 날짜</label>
              <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
            </div>
            <div className="field">
              <label>카테고리</label>
              <input list="schedule-category-options" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="예: 운영 / 광고 / 콘텐츠" />
              <div className="muted small">직접 입력하면 새 카테고리로 저장됩니다.</div>
            </div>
            {canUseGlobal && (
              <div className="field">
                <label>공지 범위</label>
                <select value={audienceScope} onChange={(e) => setAudienceScope(e.target.value as 'team' | 'global')}>
                  <option value="team">팀 공지</option>
                  <option value="global">전체 공지</option>
                </select>
              </div>
            )}
            {user.role === 'master' && audienceScope === 'team' && (
              <div className="field">
                <label>공유 대상 프로 팀</label>
                <select value={ownerProId} onChange={(e) => setOwnerProId(e.target.value)}>
                  <option value="">프로 팀 선택</option>
                  {proOptions.map((pro) => (
                    <option key={pro.id} value={pro.id}>{pro.display_name || pro.contact_name || pro.username}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="field field-full">
              <label>제목</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 5월 2주차 랜딩페이지 점검" />
            </div>
            <div className="field field-full">
              <label>메모</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="예: 체크 포인트, 준비물, 공유할 이슈" />
            </div>
          </div>
          {user.role === 'pro' && audienceScope === 'team' && <p className="desc" style={{ marginTop: 12 }}>프로 계정이 팀 공지를 등록하면 본인 팀 일정으로 자동 저장됩니다.</p>}
          {user.role === 'general' && <p className="desc" style={{ marginTop: 12 }}>일반 계정은 본인 소속 프로 팀 일정만 등록할 수 있습니다.</p>}
          {error && <div style={{ marginTop: 12, color: 'var(--red)', fontWeight: 800 }}>{error}</div>}
          <div className="toolbar mt">
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading ? '저장 중...' : editingId ? '수정 저장' : '일정 등록'}</button>
            <button className="btn btn-light" onClick={resetForm}>초기화</button>
          </div>
        </section>

        <section className="panel">
          <h2>월간 필터</h2>
          <div className={user.role === 'master' ? 'team-filter-row' : 'form-grid'}>
            <div className="field">
              <label>월 선택</label>
              <input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} />
            </div>
            <div className="field">
              <label>카테고리</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            {user.role === 'master' && (
              <div className="field">
                <label>공유 범위 / 팀</label>
                <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
                  <option value="전체">전체</option>
                  <option value="전체공지">전체 공지</option>
                  {proOptions.map((pro) => (
                    <option key={pro.id} value={pro.id}>{pro.display_name || pro.contact_name || pro.username}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <p className="desc" style={{ marginTop: 12 }}>체크 상태를 남기면 진행 여부를 바로 확인할 수 있고, 필터로 전체 공지와 팀 공지를 분리해서 볼 수 있습니다.</p>
        </section>
      </div>

      <section className="panel">
        <div className="section-title">
          <h2>{user.role === 'master' ? '프로별 일정 / 전체 공지' : '일정 / 전체 공지'}</h2>
          <span className="muted small">날짜순 정렬 / 카테고리 필터 지원</span>
        </div>
        {!visibleMemos.length && <div className="empty">조건에 맞는 일정 메모가 없습니다.</div>}

        {user.role === 'master' ? (
          <div className="team-groups">
            {groupedMemos.map((group) => (
              <section className="team-group" key={group.teamName}>
                <div className="team-group-head">
                  <h3>{group.teamName}</h3>
                  <span className="badge badge-blue">{group.memos.length}건</span>
                </div>
                <div className="card-list">
                  {group.memos.map((memo) => (
                    <article key={memo.id} className="report-card">
                      <div className="report-card-head">
                        <div>
                          <div className="title-lg" style={{ fontSize: 22 }}>{memo.title}</div>
                          <div className="title-sm">{new Date(`${memo.scheduled_date}T00:00:00`).toLocaleDateString('ko-KR')} · {memo.category} · 작성자 {memo.author_name}</div>
                          <div className="badges">
                            <span className={`badge ${memo.is_checked ? 'badge-green' : 'badge-blue'}`}>{memo.is_checked ? '완료' : '대기'}</span>
                            <span className={`badge ${memo.is_global ? 'badge-pink' : 'badge-amber'}`}>{memo.is_global ? '전체 공지' : memo.owner_pro_name}</span>
                          </div>
                        </div>
                        <div className="toolbar">
                          <button className="btn btn-light" onClick={() => toggleCheck(memo)}>{memo.is_checked ? '체크 해제' : '완료 체크'}</button>
                          <button className="btn btn-light" onClick={() => loadMemo(memo)}>수정</button>
                          <button className="btn btn-danger" onClick={() => handleDelete(memo.id)}>삭제</button>
                        </div>
                      </div>
                      <div className="report-card-body">
                        <div className="desc" style={{ whiteSpace: 'pre-line' }}>{memo.note || '-'}</div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="card-list">
            {visibleMemos.map((memo) => (
              <article key={memo.id} className="report-card">
                <div className="report-card-head">
                  <div>
                    <div className="title-lg" style={{ fontSize: 22 }}>{memo.title}</div>
                    <div className="title-sm">{new Date(`${memo.scheduled_date}T00:00:00`).toLocaleDateString('ko-KR')} · {memo.category} · {memo.is_global ? '전체 공지' : `팀 ${memo.owner_pro_name}`}</div>
                    <div className="badges">
                      <span className={`badge ${memo.is_checked ? 'badge-green' : 'badge-blue'}`}>{memo.is_checked ? '완료' : '대기'}</span>
                      <span className={`badge ${memo.is_global ? 'badge-pink' : 'badge-amber'}`}>{memo.is_global ? '전체 공지' : memo.owner_pro_name}</span>
                      <span className="badge badge-amber">작성자 {memo.author_name}</span>
                    </div>
                  </div>
                  <div className="toolbar">
                    <button className="btn btn-light" onClick={() => toggleCheck(memo)}>{memo.is_checked ? '체크 해제' : '완료 체크'}</button>
                    <button className="btn btn-light" onClick={() => loadMemo(memo)}>수정</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(memo.id)}>삭제</button>
                  </div>
                </div>
                <div className="report-card-body">
                  <div className="desc" style={{ whiteSpace: 'pre-line' }}>{memo.note || '-'}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
