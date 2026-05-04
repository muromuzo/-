'use client';

import { useState } from 'react';
import Link from 'next/link';

type Props = { mode: 'login' | 'signup' };

export default function AuthForm({ mode }: Props) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLogin = mode === 'login';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, displayName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '처리 중 오류가 발생했습니다.');
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div style={{ marginBottom: 18 }}>
        <div className="title-lg" style={{ fontSize: 28 }}>{isLogin ? '로그인' : '회원가입'}</div>
        <div className="desc" style={{ marginTop: 8 }}>
          {isLogin
            ? '회사 공용 리포트 템플릿에 로그인하세요. 최고 마스터 계정은 최초 접속 시 자동 생성됩니다.'
            : '실무 담당자 계정을 생성하고 월별 보고를 관리할 수 있습니다.'}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>아이디</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="예: polabs" required />
        </div>

        {!isLogin && (
          <div className="field" style={{ marginBottom: 14 }}>
            <label>표시 이름</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="예: PO LABS 운영팀" />
          </div>
        )}

        <div className="field" style={{ marginBottom: 14 }}>
          <label>비밀번호</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" required />
        </div>

        {error && (
          <div style={{ marginBottom: 12, color: 'var(--red)', fontWeight: 700 }}>{error}</div>
        )}

        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
        </button>
      </form>

      <div className="desc" style={{ marginTop: 16 }}>
        {isLogin ? '계정이 없다면 ' : '이미 계정이 있다면 '}
        <Link href={isLogin ? '/signup' : '/login'} style={{ color: 'var(--blue)', fontWeight: 800 }}>
          {isLogin ? '회원가입' : '로그인'}
        </Link>
      </div>
    </div>
  );
}
