import Link from 'next/link';
import PrintButton from '@/components/PrintButton';
import { requireUser } from '@/lib/auth';
import { getReportById } from '@/lib/reports';

export const dynamic = 'force-dynamic';

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

  return (
    <div className="print-page">
      <div className="print-shell">
        <div className="hide-print toolbar" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
          <Link className="btn btn-light" href="/dashboard">대시보드로 돌아가기</Link>
          <PrintButton />
        </div>

        <div className="print-header">
          <h1 style={{ marginBottom: 8 }}>{report.brand_name} 월간 성과 보고서</h1>
          <div className="desc">기준 월: {report.month_label}</div>
        </div>

        <div className="print-grid">
          <div className="print-box"><div className="small muted">총매출</div><div style={{ fontSize: 24, fontWeight: 900 }}>{won(report.gross_revenue)}</div></div>
          <div className="print-box"><div className="small muted">매출할인/제외</div><div style={{ fontSize: 24, fontWeight: 900, color: 'var(--red)' }}>{won(report.revenue_deduction)}</div></div>
          <div className="print-box"><div className="small muted">정산대상 매출</div><div style={{ fontSize: 24, fontWeight: 900, color: 'var(--blue)' }}>{won(report.adjusted_revenue)}</div></div>
          <div className="print-box"><div className="small muted">수수료</div><div style={{ fontSize: 24, fontWeight: 900, color: 'var(--pink)' }}>{won(report.fee_amount)}</div></div>
        </div>

        <div className="subgrid" style={{ marginBottom: 16 }}>
          <div className="subcard">
            <h3>핵심 정산 지표</h3>
            <div className="meta-list">
              <div className="meta-item"><span>기준매출</span><strong>{won(report.baseline_revenue)}</strong></div>
              <div className="meta-item"><span>상승매출</span><strong>{won(report.increase_amount)}</strong></div>
              <div className="meta-item"><span>증가율</span><strong>{percent(report.growth_rate)}</strong></div>
              <div className="meta-item"><span>공급가 기준 상승매출</span><strong>{won(report.supply_increase)}</strong></div>
              <div className="meta-item"><span>수수료율</span><strong>{percent(report.fee_rate)}</strong></div>
            </div>
          </div>
          <div className="subcard">
            <h3>운영 메모</h3>
            <div className="desc" style={{ whiteSpace: 'pre-line' }}>{report.manager_note || '-'}</div>
            <hr style={{ border: 0, borderTop: '1px solid #e5e7eb', margin: '14px 0' }} />
            <div className="desc" style={{ whiteSpace: 'pre-line' }}>{report.status_memo || '-'}</div>
            {report.other_note && (
              <>
                <hr style={{ border: 0, borderTop: '1px solid #e5e7eb', margin: '14px 0' }} />
                <div className="desc" style={{ whiteSpace: 'pre-line' }}>{report.other_note}</div>
              </>
            )}
          </div>
        </div>

        <div className="subgrid">
          <div className="subcard">
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
          <div className="subcard">
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
