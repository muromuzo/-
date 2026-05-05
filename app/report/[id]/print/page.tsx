import Link from 'next/link';
import type { Metadata } from 'next';
import PrintButton from '@/components/PrintButton';
import { requireUser } from '@/lib/auth';
import { getReportById } from '@/lib/reports';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: ' ' };

function won(value: number) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`;
}

function percent(value: number) {
  return `${Number(value || 0).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}%`;
}

export default async function PrintReportPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const report = await getReportById(id);

  const topMarketing = [...(report.marketing_items || [])].sort((a, b) => b.value - a.value);
  const topChannels = [...(report.revenue_channels || [])].sort((a, b) => b.revenue - a.revenue);
  const topSavings = [...(report.savings_items || [])].sort((a, b) => b.value - a.value);
  const savingsTotal = (report.savings_items || []).reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="print-page print-page-enhanced">
      <div className="print-shell">
        <div className="hide-print toolbar" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
          <Link className="btn btn-light" href="/reports">성과보고서로 돌아가기</Link>
          <PrintButton />
        </div>

        <section className="print-cover-block">
          <div className="print-cover-kicker">MONTHLY PERFORMANCE REPORT</div>
          <h1 className="print-main-title">{report.brand_name}</h1>
          <div className="print-main-subtitle">{report.month_label} 성과 요약 보고서</div>
          <div className="print-highlight-row">
            <div className="print-highlight-card">
              <div className="small muted">정산대상 매출</div>
              <div className="print-highlight-value blue">{won(report.adjusted_revenue)}</div>
            </div>
            <div className="print-highlight-card">
              <div className="small muted">상승매출</div>
              <div className="print-highlight-value green">{won(report.increase_amount)}</div>
            </div>
            <div className="print-highlight-card">
              <div className="small muted">수수료</div>
              <div className="print-highlight-value pink">{won(report.fee_amount)}</div>
            </div>
          </div>
        </section>

        <div className="print-grid print-grid-top">
          <div className="print-box soft-blue"><div className="small muted">총매출</div><div className="print-box-value">{won(report.gross_revenue)}</div></div>
          <div className="print-box soft-red"><div className="small muted">매출할인/제외</div><div className="print-box-value red">{won(report.revenue_deduction)}</div></div>
          <div className="print-box soft-amber"><div className="small muted">월 마케팅비 절감 합계</div><div className="print-box-value amber">{won(savingsTotal)}</div></div>
          <div className="print-box soft-pink"><div className="small muted">수수료율</div><div className="print-box-value pink">{percent(report.fee_rate)}</div></div>
        </div>

        <div className="subgrid" style={{ marginBottom: 18 }}>
          <div className="subcard print-panel-card">
            <h3>핵심 정산 지표</h3>
            <div className="meta-list">
              <div className="meta-item"><span>기준매출</span><strong>{won(report.baseline_revenue)}</strong></div>
              <div className="meta-item"><span>상승매출</span><strong>{won(report.increase_amount)}</strong></div>
              <div className="meta-item"><span>증가율</span><strong>{percent(report.growth_rate)}</strong></div>
              <div className="meta-item"><span>공급가 기준 상승매출</span><strong>{won(report.supply_increase)}</strong></div>
              <div className="meta-item"><span>월 마케팅비 절감 합계</span><strong>{won(savingsTotal)}</strong></div>
            </div>
          </div>
          <div className="subcard print-panel-card print-memo-card">
            <h3>운영 메모</h3>
            <div className="print-memo-text" style={{ whiteSpace: 'pre-line' }}>{report.manager_note || '-'}</div>
            <hr style={{ border: 0, borderTop: '1px solid #dbe3ef', margin: '16px 0' }} />
            <div className="print-memo-text print-memo-sub" style={{ whiteSpace: 'pre-line' }}>{report.status_memo || '-'}</div>
            {report.other_note && (
              <>
                <hr style={{ border: 0, borderTop: '1px solid #dbe3ef', margin: '16px 0' }} />
                <div className="print-memo-text print-memo-sub" style={{ whiteSpace: 'pre-line' }}>{report.other_note}</div>
              </>
            )}
          </div>
        </div>

        <div className="subgrid">
          <div className="subcard print-panel-card">
            <h3>마케팅비 상세</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>항목</th><th>금액</th></tr>
                </thead>
                <tbody>
                  {topMarketing.map((item, idx) => (
                    <tr key={`${item.name}-${idx}`}><td>{item.name}</td><td>{won(item.value)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="subcard print-panel-card">
            <h3>월 마케팅비 절감 내역</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>항목</th><th>금액</th></tr>
                </thead>
                <tbody>
                  {topSavings.length ? topSavings.map((item, idx) => (
                    <tr key={`${item.name}-${idx}`}><td>{item.name}</td><td>{won(item.value)}</td></tr>
                  )) : (
                    <tr><td colSpan={2} style={{ textAlign: 'center', color: '#64748b' }}>입력된 절감 항목이 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="subgrid" style={{ marginTop: 18 }}>
          <div className="subcard print-panel-card">
            <h3>유입채널별 매출</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>채널</th><th>매출</th></tr>
                </thead>
                <tbody>
                  {topChannels.map((item, idx) => (
                    <tr key={`${item.name}-${idx}`}><td>{item.name}</td><td>{won(item.revenue)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
