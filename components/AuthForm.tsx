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
  const [success, setSuccess] = useState('');

  const isLogin = mode === 'login';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, displayName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '처리 중 오류가 발생했습니다.');

      if (isLogin) {
        window.location.href = '/dashboard';
        return;
      }

      setSuccess('가입 요청이 접수되었습니다. 마스터 승인 후 로그인할 수 있습니다.');
      setUsername('');
      setDisplayName('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-brand">POLABS ADMIN</div>
      <div style={{ marginBottom: 18 }}>
        <div className="title-lg" style={{ fontSize: 28 }}>{isLogin ? '로그인' : '회원가입'}</div>
        {!isLogin && (
          <div className="desc" style={{ marginTop: 8 }}>
            회원가입 후 마스터 승인 완료 시 로그인할 수 있습니다.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>아이디</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="예: polabs-member" required />
        </div>

        {!isLogin && (
          <div className="field" style={{ marginBottom: 14 }}>
            <label>담당자 이름</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="예: 홍길동" required />
          </div>
        )}

        <div className="field" style={{ marginBottom: 14 }}>
          <label>비밀번호</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" required />
        </div>

        {error && <div style={{ marginBottom: 12, color: 'var(--red)', fontWeight: 700 }}>{error}</div>}
        {success && <div style={{ marginBottom: 12, color: 'var(--green)', fontWeight: 700 }}>{success}</div>}

        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? '처리 중...' : isLogin ? '로그인' : '가입 요청 보내기'}
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
