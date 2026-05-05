'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { DashboardUser, ReportRecord } from '@/lib/types';

type Pair = { name: string; value: number };

type Props = {
  user: DashboardUser;
  initialReports: ReportRecord[];
};

const defaultMarketingItems: Pair[] = [
  { name: '외부마케팅비', value: 0 },
  { name: '강남언니 광고비', value: 0 },
  { name: '미인하이 광고비', value: 0 },
  { name: '여신티켓 광고비', value: 0 },
  { name: '네이버/블로그 운영', value: 0 },
  { name: '메타/인스타 광고', value: 0 }
];

const defaultSavingsItems: Pair[] = [
  { name: '', value: 0 },
  { name: '', value: 0 },
  { name: '', value: 0 }
];

const defaultChannels: Pair[] = [
  { name: '강남언니', value: 0 },
  { name: '미인하이', value: 0 },
  { name: '여신티켓', value: 0 },
  { name: '네이버', value: 0 },
  { name: '블로그', value: 0 },
  { name: '방문경로 미확인', value: 0 }
];

function won(value: number) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`;
}

function percent(value: number) {
  return `${Number(value || 0).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}%`;
}

function toInputArray(items?: { name: string; value?: number; revenue?: number }[]) {
  if (!items?.length) return [] as Pair[];
  return items.map((item) => ({ name: item.name, value: Number(item.value ?? item.revenue ?? 0) }));
}

function normalizeChannelValues(list: Pair[], distributableTotal: number) {
  let remaining = Math.max(0, distributableTotal);
  let changed = false;

  const normalized = list.map((item) => {
    const safeValue = Math.max(0, Number(item.value) || 0);
    const nextValue = Math.min(safeValue, remaining);
    if (nextValue !== safeValue) changed = true;
    remaining = Math.max(0, remaining - nextValue);
    return { ...item, value: nextValue };
  });

  return { normalized, changed };
}

export default function DashboardClient({ user, initialReports }: Props) {
  const [reports, setReports] = useState(initialReports);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [brandName, setBrandName] = useState('');
  const [monthLabel, setMonthLabel] = useState('');
  const [grossRevenue, setGrossRevenue] = useState<number>(0);
  const [revenueDeduction, setRevenueDeduction] = useState<number>(0);
  const [baselineRevenue, setBaselineRevenue] = useState<number>(0);
  const [feeRate, setFeeRate] = useState<number>(16.5);
  const [managerNote, setManagerNote] = useState('');
  const [otherNote, setOtherNote] = useState('');
  const [statusMemo, setStatusMemo] = useState('');
  const [marketingItems, setMarketingItems] = useState<Pair[]>(defaultMarketingItems);
  const [savingsItems, setSavingsItems] = useState<Pair[]>(defaultSavingsItems);
  const [channels, setChannels] = useState<Pair[]>(defaultChannels);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculated = useMemo(() => {
    const adjustedRevenue = grossRevenue - revenueDeduction;
    const increaseAmount = adjustedRevenue - baselineRevenue;
    const growthRate = baselineRevenue > 0 ? (increaseAmount / baselineRevenue) * 100 : 0;
    const supplyIncrease = increaseAmount > 0 ? increaseAmount / 1.1 : 0;
    const feeAmount = supplyIncrease * (feeRate / 100);
    const marketingTotal = marketingItems.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    const savingsTotal = savingsItems.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    const distributableChannelRevenue = Math.max(0, adjustedRevenue - marketingTotal);
    const assignedChannelRevenue = channels.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    const remainingChannelRevenue = Math.max(0, distributableChannelRevenue - assignedChannelRevenue);
    return {
      adjustedRevenue,
      increaseAmount,
      growthRate,
      supplyIncrease,
      feeAmount,
      marketingTotal,
      savingsTotal,
      distributableChannelRevenue,
      assignedChannelRevenue,
      remainingChannelRevenue
    };
  }, [grossRevenue, revenueDeduction, baselineRevenue, feeRate, marketingItems, savingsItems, channels]);

  function updatePair(list: Pair[], index: number, key: 'name' | 'value', next: string) {
    const copied = [...list];
    copied[index] = {
      ...copied[index],
      [key]: key === 'value' ? Number(next) || 0 : next
    } as Pair;
    return copied;
  }

  function updateChannelValue(index: number, next: string) {
    const nextValue = Math.max(0, Number(next) || 0);
    const copied = [...channels];
    copied[index] = { ...copied[index], value: nextValue };
    return normalizeChannelValues(copied, calculated.distributableChannelRevenue).normalized;
  }

  function getChannelUsedBefore(index: number) {
    return channels.slice(0, index).reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  }

  function getChannelRowMax(index: number) {
    return Math.max(0, calculated.distributableChannelRevenue - getChannelUsedBefore(index));
  }

  function getChannelRemainingAfter(index: number) {
    const usedIncludingCurrent = channels.slice(0, index + 1).reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    return Math.max(0, calculated.distributableChannelRevenue - usedIncludingCurrent);
  }

  useEffect(() => {
    setChannels((prev) => {
      const { normalized, changed } = normalizeChannelValues(prev, calculated.distributableChannelRevenue);
      return changed ? normalized : prev;
    });
  }, [calculated.distributableChannelRevenue]);

  function resetForm() {
    setEditingId(null);
    setBrandName('');
    setMonthLabel('');
    setGrossRevenue(0);
    setRevenueDeduction(0);
    setBaselineRevenue(0);
    setFeeRate(16.5);
    setManagerNote('');
    setOtherNote('');
    setStatusMemo('');
    setMarketingItems(defaultMarketingItems);
    setSavingsItems(defaultSavingsItems);
    setChannels(defaultChannels);
    setError('');
  }

  function loadReport(report: ReportRecord) {
    setEditingId(report.id);
    setBrandName(report.brand_name);
    setMonthLabel(report.month_label);
    setGrossRevenue(report.gross_revenue);
    setRevenueDeduction(report.revenue_deduction);
    setBaselineRevenue(report.baseline_revenue);
    setFeeRate(report.fee_rate);
    setManagerNote(report.manager_note || '');
    setOtherNote(report.other_note || '');
    setStatusMemo(report.status_memo || '');
    setMarketingItems(toInputArray(report.marketing_items).length ? toInputArray(report.marketing_items) : defaultMarketingItems);
    setSavingsItems(toInputArray(report.savings_items).length ? toInputArray(report.savings_items) : defaultSavingsItems);
    setChannels(toInputArray(report.revenue_channels).length ? toInputArray(report.revenue_channels) : defaultChannels);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSave() {
    setLoading(true);
    setError('');
    try {
      const payload = {
        brandName,
        monthLabel,
        grossRevenue,
        revenueDeduction,
        baselineRevenue,
        feeRate,
        managerNote,
        otherNote,
        statusMemo,
        marketingItems: marketingItems.filter((item) => item.name.trim()),
        savingsItems: savingsItems.filter((item) => item.name.trim()),
        channels: channels.filter((item) => item.name.trim())
      };

      const endpoint = editingId ? `/api/reports/${editingId}` : '/api/reports';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '저장에 실패했습니다.');
      const nextReports = editingId
        ? reports.map((item) => (item.id === data.report.id ? data.report : item))
        : [data.report, ...reports];
      setReports(nextReports);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 보고서를 삭제할까요?')) return;
    const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || '삭제에 실패했습니다.');
      return;
    }
    setReports((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <div className="container">
      <section className="hero">
        <h1>회사 공용 월별 성과 / 정산 템플릿</h1>
        <p>
          회원가입, 관리자 권한, 월별 입력, 마케팅비 자유 항목, 유입채널 매출, 수수료 자동 계산,
          PDF 보고서 출력까지 한 번에 처리할 수 있는 템플릿입니다.
        </p>
        <div className="toolbar mt">
          <div className="badge badge-blue">로그인 사용자: {user.display_name || user.username}</div>
          <div className="badge badge-amber">권한: {user.role}</div>
          <Link className="btn btn-white" href="/plans">월별 계획서</Link>
          {(user.role === 'admin' || user.role === 'master') && (
            <Link className="btn btn-white" href="/admin/users">회원 / 권한 관리</Link>
          )}
          <button className="btn btn-ghost" onClick={handleLogout}>로그아웃</button>
        </div>
      </section>

      <div className="grid-2">
        <section className="panel">
          <h2>{editingId ? '월별 데이터 수정' : '월별 데이터 입력'}</h2>
          <p className="desc">
            병원뿐 아니라 다른 업종에서도 사용할 수 있도록 브랜드명, 수수료율, 매출 제외금액, 마케팅비 항목명을 모두 자유롭게 입력할 수 있게 만들었습니다.
          </p>

          <div className="form-grid">
            <div className="field">
              <label>병원명 / 브랜드명</label>
              <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="예: OO피부과 / OO브랜드" />
            </div>
            <div className="field">
              <label>기준 월</label>
              <input value={monthLabel} onChange={(e) => setMonthLabel(e.target.value)} placeholder="예: 2026년 4월" />
            </div>
            <div className="field">
              <label>총매출</label>
              <input type="number" value={grossRevenue || ''} onChange={(e) => setGrossRevenue(Number(e.target.value) || 0)} />
            </div>
            <div className="field">
              <label>매출할인 / 매출제외 금액</label>
              <input type="number" value={revenueDeduction || ''} onChange={(e) => setRevenueDeduction(Number(e.target.value) || 0)} />
            </div>
            <div className="field">
              <label>기준매출</label>
              <input type="number" value={baselineRevenue || ''} onChange={(e) => setBaselineRevenue(Number(e.target.value) || 0)} />
            </div>
            <div className="field">
              <label>수수료율(%)</label>
              <input type="number" step="0.1" value={feeRate || ''} onChange={(e) => setFeeRate(Number(e.target.value) || 0)} />
            </div>
            <div className="field">
              <label>진행상태 요약</label>
              <input value={managerNote} onChange={(e) => setManagerNote(e.target.value)} placeholder="예: 신규 채널 테스트 / 운영 확대" />
            </div>
            <div className="field">
              <label>기타 메모</label>
              <input value={otherNote} onChange={(e) => setOtherNote(e.target.value)} placeholder="예: 정산 이슈 / 이벤트 반영" />
            </div>
          </div>

          <div className="section-title">
            <h3>전체 마케팅비 항목</h3>
            <button className="btn btn-light" type="button" onClick={() => setMarketingItems([...marketingItems, { name: '', value: 0 }])}>항목 추가</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>항목명</th><th>금액</th></tr>
              </thead>
              <tbody>
                {marketingItems.map((item, index) => (
                  <tr key={`m-${index}`}>
                    <td><input value={item.name} onChange={(e) => setMarketingItems(updatePair(marketingItems, index, 'name', e.target.value))} /></td>
                    <td><input type="number" value={item.value || ''} onChange={(e) => setMarketingItems(updatePair(marketingItems, index, 'value', e.target.value))} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section-title">
            <h3>월 마케팅비 절감 내역</h3>
            <button className="btn btn-light" type="button" onClick={() => setSavingsItems([...savingsItems, { name: '', value: 0 }])}>항목 추가</button>
          </div>
          <p className="desc" style={{ marginTop: -4, marginBottom: 10 }}>
            우리를 통해 절감한 항목과 금액을 자유롭게 추가하세요. 입력한 내용은 PDF 보고서에도 자동 반영됩니다.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>항목</th><th>금액</th></tr>
              </thead>
              <tbody>
                {savingsItems.map((item, index) => (
                  <tr key={`s-${index}`}>
                    <td><input value={item.name} onChange={(e) => setSavingsItems(updatePair(savingsItems, index, 'name', e.target.value))} placeholder="예: 외부마케팅 대행비 절감" /></td>
                    <td><input type="number" value={item.value || ''} onChange={(e) => setSavingsItems(updatePair(savingsItems, index, 'value', e.target.value))} placeholder="예: 10550000" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section-title">
            <h3>유입채널별 매출</h3>
            <button className="btn btn-light" type="button" onClick={() => setChannels([...channels, { name: '', value: 0 }])}>채널 추가</button>
          </div>
          <div className="subgrid" style={{ marginBottom: 12 }}>
            <div className="subcard">
              <h4>채널 배분 가능 총액</h4>
              <div className="meta-list">
                <div className="meta-item"><span>총매출 - 매출제외 - 전체 마케팅비</span><strong>{won(calculated.distributableChannelRevenue)}</strong></div>
                <div className="meta-item"><span>현재 입력 합계</span><strong>{won(calculated.assignedChannelRevenue)}</strong></div>
                <div className="meta-item"><span>남은 배분 가능 금액</span><strong>{won(calculated.remainingChannelRevenue)}</strong></div>
              </div>
              <div className="muted small" style={{ marginTop: 10 }}>
                위에서부터 순서대로 금액이 차감됩니다. 예를 들어 1번째 채널에 100만원을 입력하면 2번째 채널의 최대 입력 가능 금액은 자동으로 그만큼 줄어듭니다.
              </div>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>채널명</th><th>매출</th></tr>
              </thead>
              <tbody>
                {channels.map((item, index) => {
                  const rowMax = getChannelRowMax(index);
                  const rowRemainingAfter = getChannelRemainingAfter(index);
                  return (
                    <tr key={`c-${index}`}>
                      <td><input value={item.name} onChange={(e) => setChannels(updatePair(channels, index, 'name', e.target.value))} /></td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          max={rowMax}
                          value={item.value || ''}
                          placeholder={`최대 ${rowMax.toLocaleString('ko-KR')}`}
                          onChange={(e) => setChannels(updateChannelValue(index, e.target.value))}
                        />
                        <div className="muted small" style={{ marginTop: 6 }}>
                          이 행 최대 입력 가능 금액: {won(rowMax)} / 입력 후 다음 채널에 남는 금액: {won(rowRemainingAfter)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="field-full" style={{ marginTop: 16 }}>
            <label>진행현황 메모</label>
            <textarea value={statusMemo} onChange={(e) => setStatusMemo(e.target.value)} placeholder="예: 채널별 진행상황, 운영 이슈, 완료/대기 메모" />
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
          <h2>자동 계산 미리보기</h2>
          <p className="desc">정산대상 매출, 상승매출, 공급가 기준 상승매출, 수수료를 자동 계산합니다.</p>
          <div className="stats">
            <div className="stat"><div className="label">정산대상 매출</div><div className="value blue">{won(calculated.adjustedRevenue)}</div><small>총매출 - 매출할인/매출제외 금액</small></div>
            <div className="stat"><div className="label">상승매출</div><div className="value green">{won(calculated.increaseAmount)}</div><small>정산대상 매출 - 기준매출</small></div>
            <div className="stat"><div className="label">증가율</div><div className="value green">{percent(calculated.growthRate)}</div><small>상승매출 ÷ 기준매출</small></div>
            <div className="stat"><div className="label">전체 마케팅비</div><div className="value red">{won(calculated.marketingTotal)}</div><small>입력한 모든 마케팅비 항목 합계</small></div>
            <div className="stat"><div className="label">절감 합계</div><div className="value blue">{won(calculated.savingsTotal)}</div><small>월 마케팅비 절감 내역 합계</small></div>
            <div className="stat"><div className="label">채널 배분 가능 총액</div><div className="value blue">{won(calculated.distributableChannelRevenue)}</div><small>총매출 - 매출제외 - 전체 마케팅비</small></div>
            <div className="stat"><div className="label">채널 배분 잔액</div><div className="value amber">{won(calculated.remainingChannelRevenue)}</div><small>유입채널에 아직 배분하지 않은 금액</small></div>
            <div className="stat"><div className="label">공급가 기준 상승매출</div><div className="value amber">{won(Math.round(calculated.supplyIncrease))}</div><small>상승매출 ÷ 1.1</small></div>
            <div className="stat"><div className="label">수수료율</div><div className="value pink">{percent(feeRate)}</div><small>월별 수정 가능</small></div>
            <div className="stat wide"><div className="label">수수료 자동계산</div><div className="value pink">{won(Math.round(calculated.feeAmount))}</div><small>(상승매출 ÷ 1.1) × 수수료율</small></div>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="section-title">
          <h2>월별 누적 카드</h2>
          <span className="muted small">최신 입력 순으로 정렬됩니다. PDF 버튼을 누르면 보고서형 템플릿으로 이동합니다.</span>
        </div>

        {!reports.length && <div className="empty">아직 저장된 보고서가 없습니다.</div>}

        <div className="card-list">
          {reports.map((report) => {
            const marketingTop = [...(report.marketing_items || [])].sort((a, b) => b.value - a.value).slice(0, 5);
            const savingsTop = [...(report.savings_items || [])].sort((a, b) => b.value - a.value).slice(0, 5);
            const savingsTotal = (report.savings_items || []).reduce((sum, item) => sum + item.value, 0);
            const channelTop = [...(report.revenue_channels || [])].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

            return (
              <article key={report.id} className="report-card">
                <div className="report-card-head">
                  <div>
                    <div className="title-lg">{report.brand_name}</div>
                    <div className="title-sm">{report.month_label}</div>
                    <div className="badges">
                      <span className="badge badge-blue">정산대상 매출 {won(report.adjusted_revenue)}</span>
                      <span className="badge badge-green">증가율 {percent(report.growth_rate)}</span>
                      <span className="badge badge-red">마케팅비 {won(report.marketing_items.reduce((sum, item) => sum + item.value, 0))}</span>
                      <span className="badge badge-blue">절감액 {won(savingsTotal)}</span>
                      <span className="badge badge-pink">수수료 {won(report.fee_amount)}</span>
                      <span className="badge badge-amber">수수료율 {percent(report.fee_rate)}</span>
                    </div>
                  </div>
                  <div className="toolbar">
                    <button className="btn btn-light" onClick={() => loadReport(report)}>불러오기</button>
                    <Link className="btn btn-white" href={`/report/${report.id}/print`} target="_blank">PDF</Link>
                    <button className="btn btn-danger" onClick={() => handleDelete(report.id)}>삭제</button>
                  </div>
                </div>
                <div className="report-card-body">
                  <div className="kpi-grid">
                    <div className="kpi"><div className="kpi-label">총매출</div><div className="kpi-value">{won(report.gross_revenue)}</div></div>
                    <div className="kpi"><div className="kpi-label">매출제외</div><div className="kpi-value red">{won(report.revenue_deduction)}</div></div>
                    <div className="kpi"><div className="kpi-label">기준매출</div><div className="kpi-value">{won(report.baseline_revenue)}</div></div>
                    <div className="kpi"><div className="kpi-label">상승매출</div><div className="kpi-value green">{won(report.increase_amount)}</div></div>
                    <div className="kpi"><div className="kpi-label">절감합계</div><div className="kpi-value blue">{won(savingsTotal)}</div></div>
                    <div className="kpi"><div className="kpi-label">수수료</div><div className="kpi-value pink">{won(report.fee_amount)}</div></div>
                  </div>

                  <div className="subgrid">
                    <div className="subcard">
                      <h4>상위 마케팅비 항목</h4>
                      <div className="meta-list">
                        {marketingTop.length ? marketingTop.map((item, idx) => (
                          <div className="meta-item" key={`${item.name}-${idx}`}><span>{item.name}</span><strong>{won(item.value)}</strong></div>
                        )) : <div className="muted">입력된 항목이 없습니다.</div>}
                      </div>
                    </div>
                    <div className="subcard">
                      <h4>월 마케팅비 절감 내역</h4>
                      <div className="meta-list">
                        {savingsTop.length ? savingsTop.map((item, idx) => (
                          <div className="meta-item" key={`${item.name}-${idx}`}><span>{item.name}</span><strong>{won(item.value)}</strong></div>
                        )) : <div className="muted">입력된 절감 항목이 없습니다.</div>}
                      </div>
                    </div>
                  </div>

                  <div className="subgrid" style={{ marginTop: 16 }}>
                    <div className="subcard">
                      <h4>상위 유입채널</h4>
                      <div className="meta-list">
                        {channelTop.length ? channelTop.map((item, idx) => (
                          <div className="meta-item" key={`${item.name}-${idx}`}><span>{item.name}</span><strong>{won(item.revenue)}</strong></div>
                        )) : <div className="muted">입력된 채널이 없습니다.</div>}
                      </div>
                    </div>
                    <div className="subcard">
                      <h4>진행상태 요약</h4>
                      <div className="desc" style={{ whiteSpace: 'pre-line' }}>{report.manager_note || '-'}</div>
                      <hr style={{ border: 0, borderTop: '1px solid #e5e7eb', margin: '12px 0' }} />
                      <div className="desc" style={{ whiteSpace: 'pre-line' }}>{report.status_memo || '-'}</div>
                    </div>
                  </div>

                  <div className="subgrid" style={{ marginTop: 16 }}>
                    <div className="subcard">
                      <h4>기타 메모</h4>
                      <div className="desc" style={{ whiteSpace: 'pre-line' }}>{report.other_note || '-'}</div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
