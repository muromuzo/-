'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { DashboardUser, UserRole } from '@/lib/types';

type Props = {
  currentUser: DashboardUser;
  initialUsers: DashboardUser[];
};

export default function UsersAdmin({ currentUser, initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [message, setMessage] = useState('');

  async function changeRole(userId: string, role: UserRole) {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || '권한 변경에 실패했습니다.');
      return;
    }
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)));
    setMessage('권한이 변경되었습니다.');
  }

  return (
    <div className="container">
      <section className="hero">
        <h1>회원 / 권한 관리</h1>
        <p>마스터 계정은 role을 master로 유지하고, 실무 담당자는 admin 또는 user로 권한을 부여할 수 있습니다.</p>
        <div className="toolbar mt">
          <div className="badge badge-blue">현재 관리자: {currentUser.display_name || currentUser.username}</div>
          <div className="badge badge-amber">권한: {currentUser.role}</div>
          <Link className="btn btn-white" href="/dashboard">대시보드로 돌아가기</Link>
        </div>
      </section>

      <section className="panel">
        <h2>사용자 목록</h2>
        <p className="desc">회원가입된 계정의 권한을 조정할 수 있습니다. master 권한은 다른 계정으로 변경할 수 없습니다.</p>
        {message && <div style={{ marginBottom: 12, color: 'var(--green)', fontWeight: 800 }}>{message}</div>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>아이디</th>
                <th>표시 이름</th>
                <th>권한</th>
                <th>생성일</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.display_name || '-'}</td>
                  <td>
                    {user.role === 'master' ? (
                      <span className="badge badge-amber">master</span>
                    ) : (
                      <select value={user.role} onChange={(e) => changeRole(user.id, e.target.value as UserRole)}>
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    )}
                  </td>
                  <td>{new Date(user.created_at).toLocaleString('ko-KR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
