'use client';

import { useState } from 'react';
import AppTabs from '@/components/AppTabs';
import type { DashboardUser, MonthlyPlanRecord } from '@/lib/types';

type PlanPair = { title: string; note: string };

type Props = {
  user: DashboardUser;
  initialPlans: MonthlyPlanRecord[];
};

const defaultPlanItems: PlanPair[] = [
  { title: '', note: '' },
  { title: '', note: '' },
  { title: '', note: '' }
];

export default function PlansClient({ user, initialPlans }: Props) {
  const [plans, setPlans] = useState(initialPlans);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [brandName, setBrandName] = useState('');
  const [monthLabel, setMonthLabel] = useState('');
  const [planMemo, setPlanMemo] = useState('');
  const [items, setItems] = useState<PlanPair[]>(defaultPlanItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function updateItem(index: number, key: 'title' | 'note', value: string) {
    const copied = [...items];
    copied[index] = { ...copied[index], [key]: value };
    return copied;
  }

  function resetForm() {
    setEditingId(null);
    setBrandName('');
    setMonthLabel('');
    setPlanMemo('');
    setItems(defaultPlanItems);
    setError('');
  }

  function loadPlan(plan: MonthlyPlanRecord) {
    setEditingId(plan.id);
    setBrandName(plan.brand_name);
    setMonthLabel(plan.month_label);
    setPlanMemo(plan.plan_memo || '');
    setItems(plan.plan_items?.length ? plan.plan_items.map((item) => ({ title: item.title, note: item.note || '' })) : defaultPlanItems);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSave() {
    setLoading(true);
    setError('');
    try {
      const payload = {
        brandName,
        monthLabel,
        planMemo,
        items: items.filter((item) => item.title.trim() || item.note.trim())
      };
      const endpoint = editingId ? `/api/plans/${editingId}` : '/api/plans';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '저장에 실패했습니다.');
      const nextPlans = editingId
        ? plans.map((item) => (item.id === data.plan.id ? data.plan : item))
        : [data.plan, ...plans];
      setPlans(nextPlans);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 계획서를 삭제할까요?')) return;
    const res = await fetch(`/api/plans/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || '삭제에 실패했습니다.');
      return;
    }
    setPlans((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <div className="container">
      <AppTabs user={user} active="plans" description="브랜드별 월간 마케팅 계획, 실행 항목, 비고사항을 따로 기록하고 누적 관리합니다." />

      <div className="grid-2">
        <section className="panel">
          <h2>{editingId ? '계획서 수정' : '계획서 입력'}</h2>
          <p className="desc">브랜드별·월별 계획 항목과 비고사항을 자유롭게 추가하고 누적 관리할 수 있습니다.</p>

          <div className="form-grid">
            <div className="field">
              <label>병원명 / 브랜드명</label>
              <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="예: OO피부과 / OO브랜드" />
            </div>
            <div className="field">
              <label>기준 월</label>
              <input value={monthLabel} onChange={(e) => setMonthLabel(e.target.value)} placeholder="예: 2026년 6월" />
            </div>
          </div>

          <div className="section-title">
            <h3>월별 마케팅 계획 항목</h3>
            <button className="btn btn-light" type="button" onClick={() => setItems([...items, { title: '', note: '' }])}>항목 추가</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>계획 항목</th><th>비고사항</th></tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={`p-${index}`}>
                    <td><input value={item.title} onChange={(e) => setItems(updateItem(index, 'title', e.target.value))} placeholder="예: 네이버 플레이스 리뷰 관리 강화" /></td>
                    <td><textarea value={item.note} onChange={(e) => setItems(updateItem(index, 'note', e.target.value))} placeholder="예: 2주 단위 진행 체크, 월말 결과 점검" style={{ minHeight: 84 }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="field-full" style={{ marginTop: 16 }}>
            <label>추가 메모</label>
            <textarea value={planMemo} onChange={(e) => setPlanMemo(e.target.value)} placeholder="예: 병원 요청사항, 우선순위, 예산 참고 메모" />
          </div>

          {error && <div style={{ marginTop: 12, color: 'var(--red)', fontWeight: 800 }}>{error}</div>}

          <div className="toolbar mt">
            <button className="btn btn-primary" type="button" onClick={handleSave} disabled={loading}>
              {loading ? '저장 중...' : editingId ? '수정 저장' : '신규 저장'}
            </button>
            <button className="btn btn-light" type="button" onClick={resetForm}>입력 초기화</button>
          </div>
        </section>

        <section className="panel">
          <h2>작성 가이드</h2>
          <div className="subcard plan-guide-card">
            <div className="meta-list">
              <div className="meta-item"><span>계획 항목</span><strong>실행할 액션을 짧고 명확하게</strong></div>
              <div className="meta-item"><span>비고사항</span><strong>기간, 우선순위, 담당, 체크포인트 작성</strong></div>
              <div className="meta-item"><span>추가 메모</span><strong>브랜드 특이사항, 요청사항, 예산 메모</strong></div>
            </div>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="section-title">
          <h2>월별 계획서 누적 카드</h2>
          <span className="muted small">최신 입력 순으로 정렬됩니다.</span>
        </div>
        {!plans.length && <div className="empty">아직 저장된 계획서가 없습니다.</div>}
        <div className="card-list">
          {plans.map((plan) => (
            <article key={plan.id} className="report-card">
              <div className="report-card-head">
                <div>
                  <div className="title-lg">{plan.brand_name}</div>
                  <div className="title-sm">{plan.month_label}</div>
                  <div className="badges">
                    <span className="badge badge-blue">계획 항목 {plan.plan_items?.length || 0}건</span>
                  </div>
                </div>
                <div className="toolbar">
                  <button className="btn btn-light" onClick={() => loadPlan(plan)}>불러오기</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(plan.id)}>삭제</button>
                </div>
              </div>
              <div className="report-card-body">
                <div className="subcard">
                  <h4>계획 항목 / 비고사항</h4>
                  <div className="meta-list">
                    {plan.plan_items?.length ? plan.plan_items.map((item, idx) => (
                      <div className="plan-line" key={`${item.title}-${idx}`}>
                        <div className="plan-line-title">{item.title}</div>
                        <div className="desc" style={{ whiteSpace: 'pre-line' }}>{item.note || '-'}</div>
                      </div>
                    )) : <div className="muted">입력된 계획 항목이 없습니다.</div>}
                  </div>
                  {plan.plan_memo && (
                    <>
                      <hr style={{ border: 0, borderTop: '1px solid #e5e7eb', margin: '14px 0' }} />
                      <h4>추가 메모</h4>
                      <div className="desc" style={{ whiteSpace: 'pre-line' }}>{plan.plan_memo}</div>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
