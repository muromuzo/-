'use client';

import { useMemo, useState } from 'react';
import AppTabs from '@/components/AppTabs';
import type { ApprovalStatus, DashboardUser, ManagedUser, UserRole } from '@/lib/types';

const JOB_TITLE_OPTIONS = ['운영팀', '내근팀', '상담팀', '마케팅팀', '디자인팀', 'CS팀', '재무팀'];

type Props = {
  currentUser: DashboardUser;
  initialUsers: ManagedUser[];
  proOptions: DashboardUser[];
};

type DraftMap = Record<string, {
  role: UserRole;
  approval_status: ApprovalStatus;
  manager_user_id: string | null;
  display_name: string | null;
  job_title: string | null;
}>;

type PasswordMap = Record<string, string>;

const roleLabel: Record<UserRole, string> = {
  master: '마스터',
  pro: '프로',
  general: '일반'
};

const statusLabel: Record<ApprovalStatus, string> = {
  pending: '승인대기',
  approved: '승인완료',
  rejected: '거절'
};

export default function UsersAdmin({ currentUser, initialUsers, proOptions }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [message, setMessage] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [passwordLoadingId, setPasswordLoadingId] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftMap>(() => Object.fromEntries(initialUsers.map((user) => [
    user.id,
    {
      role: user.role,
      approval_status: user.approval_status,
      manager_user_id: user.manager_user_id,
      display_name: user.display_name,
      job_title: user.job_title
    }
  ])));
  const [passwordDrafts, setPasswordDrafts] = useState<PasswordMap>(() => Object.fromEntries(initialUsers.map((user) => [user.id, ''])));

  const pendingCount = useMemo(() => users.filter((user) => user.approval_status === 'pending').length, [users]);

  function updateDraft(userId: string, key: keyof DraftMap[string], value: string) {
    setDrafts((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [key]: value || null
      }
    }));
  }

  async function saveUser(userId: string) {
    setLoadingId(userId);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(drafts[userId])
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '계정 저장에 실패했습니다.');

      setUsers((prev) => prev.map((user) => (user.id === userId ? data.user : user)));
      setDrafts((prev) => ({
        ...prev,
        [userId]: {
          role: data.user.role,
          approval_status: data.user.approval_status,
          manager_user_id: data.user.manager_user_id,
          display_name: data.user.display_name,
          job_title: data.user.job_title
        }
      }));
      setMessage('계정 설정이 저장되었습니다.');
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoadingId(null);
    }
  }

  async function updatePassword(userId: string) {
    const password = passwordDrafts[userId]?.trim();
    if (!password) {
      alert('새 비밀번호를 입력해 주세요.');
      return;
    }
    if (password.length < 6) {
      alert('비밀번호는 6자 이상 입력해 주세요.');
      return;
    }

    setPasswordLoadingId(userId);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/users/${userId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '비밀번호 변경에 실패했습니다.');

      setPasswordDrafts((prev) => ({ ...prev, [userId]: '' }));
      setMessage('비밀번호가 변경되었습니다.');
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setPasswordLoadingId(null);
    }
  }

  async function deleteUser(userId: string) {
    const target = users.find((user) => user.id === userId);
    if (!target) return;
    if (userId === currentUser.id) {
      alert('현재 로그인한 마스터 계정은 삭제할 수 없습니다.');
      return;
    }
    if (!confirm(`${target.display_name || target.username} 계정을 삭제할까요? 관련 작성 데이터도 함께 정리될 수 있습니다.`)) return;

    setDeleteLoadingId(userId);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '계정 삭제에 실패했습니다.');
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setMessage('계정이 삭제되었습니다.');
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setDeleteLoadingId(null);
    }
  }

  return (
    <div className="container">
      <AppTabs user={currentUser} active="users" description="가입 승인, 권한 조정, 담당자 이름/직무 배정, 비밀번호 변경, 계정 삭제까지 마스터가 한 화면에서 관리합니다." />

      <section className="panel">
        <div className="section-title">
          <div>
            <h2>계정관리</h2>
            <p className="desc">담당자 이름은 표시 이름 기준으로 관리하고, 직무는 마스터가 직접 배정할 수 있게 구성했습니다. 비밀번호 변경과 계정 삭제도 여기서 바로 처리할 수 있습니다.</p>
          </div>
          <div className="badge badge-amber">승인 대기 {pendingCount}명</div>
        </div>

        <datalist id="job-title-options">
          {JOB_TITLE_OPTIONS.map((item) => <option key={item} value={item} />)}
        </datalist>

        {message && <div style={{ marginBottom: 12, color: 'var(--green)', fontWeight: 800 }}>{message}</div>}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>아이디</th>
                <th>담당자 이름</th>
                <th>직무</th>
                <th>가입 상태</th>
                <th>권한</th>
                <th>소속 프로</th>
                <th>비밀번호 변경</th>
                <th>계정 삭제</th>
                <th>생성일</th>
                <th>저장</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const draft = drafts[user.id];
                const isMaster = user.role === 'master';
                const isSelf = user.id === currentUser.id;
                return (
                  <tr key={user.id}>
                    <td>
                      <div style={{ fontWeight: 800 }}>{user.username}</div>
                      {user.approved_by_name && <div className="muted small">승인자: {user.approved_by_name}</div>}
                    </td>
                    <td>
                      <input
                        value={draft.display_name || ''}
                        onChange={(e) => updateDraft(user.id, 'display_name', e.target.value)}
                        placeholder="담당자 이름"
                      />
                    </td>
                    <td>
                      <input
                        list="job-title-options"
                        value={draft.job_title || ''}
                        onChange={(e) => updateDraft(user.id, 'job_title', e.target.value)}
                        placeholder="예: 운영팀"
                      />
                    </td>
                    <td>
                      {isMaster ? (
                        <span className="badge badge-amber">마스터</span>
                      ) : (
                        <select value={draft.approval_status} onChange={(e) => updateDraft(user.id, 'approval_status', e.target.value)}>
                          <option value="pending">승인대기</option>
                          <option value="approved">승인완료</option>
                          <option value="rejected">거절</option>
                        </select>
                      )}
                      {!isMaster && <div className="muted small" style={{ marginTop: 6 }}>{statusLabel[draft.approval_status]}</div>}
                    </td>
                    <td>
                      {isMaster ? (
                        <span className="badge badge-amber">마스터</span>
                      ) : (
                        <select value={draft.role} onChange={(e) => updateDraft(user.id, 'role', e.target.value)}>
                          <option value="general">일반</option>
                          <option value="pro">프로</option>
                        </select>
                      )}
                      {!isMaster && <div className="muted small" style={{ marginTop: 6 }}>{roleLabel[draft.role]}</div>}
                    </td>
                    <td>
                      {isMaster || draft.role !== 'general' ? (
                        <span className="muted">-</span>
                      ) : (
                        <select value={draft.manager_user_id || ''} onChange={(e) => updateDraft(user.id, 'manager_user_id', e.target.value)}>
                          <option value="">미지정</option>
                          {proOptions.map((pro) => (
                            <option key={pro.id} value={pro.id}>{pro.display_name || pro.contact_name || pro.username}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      <div className="password-inline">
                        <input
                          type="password"
                          value={passwordDrafts[user.id] || ''}
                          onChange={(e) => setPasswordDrafts((prev) => ({ ...prev, [user.id]: e.target.value }))}
                          placeholder={isMaster ? '마스터 비밀번호 변경' : '새 비밀번호'}
                        />
                        <button className="btn btn-light" onClick={() => updatePassword(user.id)} disabled={passwordLoadingId === user.id}>
                          {passwordLoadingId === user.id ? '변경 중...' : '변경'}
                        </button>
                      </div>
                    </td>
                    <td>
                      {isSelf ? (
                        <span className="muted small">현재 로그인 계정</span>
                      ) : (
                        <button className="btn btn-danger" onClick={() => deleteUser(user.id)} disabled={deleteLoadingId === user.id}>
                          {deleteLoadingId === user.id ? '삭제 중...' : '삭제'}
                        </button>
                      )}
                    </td>
                    <td>{new Date(user.created_at).toLocaleString('ko-KR')}</td>
                    <td>
                      <button className="btn btn-light" onClick={() => saveUser(user.id)} disabled={loadingId === user.id}>
                        {loadingId === user.id ? '저장 중...' : '저장'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
