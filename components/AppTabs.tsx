'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { DashboardUser } from '@/lib/types';

const roleLabel: Record<DashboardUser['role'], string> = {
  master: '마스터',
  pro: '프로',
  general: '일반'
};

type TabKey = 'reports' | 'plans' | 'board' | 'schedule' | 'users';

type Props = {
  user: DashboardUser;
  active: TabKey;
  description: string;
};

export default function AppTabs({ user, active, description }: Props) {
  const tabs = useMemo(() => {
    const base = [
      { key: 'reports', label: '성과보고서', href: '/dashboard' },
      { key: 'plans', label: '월별 마케팅계획서', href: '/plans' },
      { key: 'board', label: '사내 게시판', href: '/board' },
      { key: 'schedule', label: '일정 메모', href: '/schedule' }
    ];

    if (user.role === 'master') {
      base.push({ key: 'users', label: '계정관리', href: '/admin/users' });
    }

    return base as Array<{ key: TabKey; label: string; href: string }>;
  }, [user.role]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <section className="hero">
      <div className="app-header-row">
        <div>
          <div className="hero-kicker">WORKSPACE</div>
          <h1>POLABS ADMIN</h1>
          <p>{description}</p>
        </div>
        <div className="toolbar">
          <div className="badge badge-blue">사용자: {user.display_name || user.username}</div>
          <div className="badge badge-amber">권한: {roleLabel[user.role]}</div>
          <button className="btn btn-ghost" onClick={handleLogout}>로그아웃</button>
        </div>
      </div>

      <div className="app-tabs">
        {tabs.map((tab) => (
          <Link key={tab.key} className={`app-tab ${active === tab.key ? 'active' : ''}`} href={tab.href}>
            {tab.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
