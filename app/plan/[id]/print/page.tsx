import Link from 'next/link';
import type { Metadata } from 'next';
import PrintButton from '@/components/PrintButton';
import { requireUser } from '@/lib/auth';
import { getPlanById } from '@/lib/plans';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: ' ' };

export default async function PrintPlanPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const plan = await getPlanById(id);
  const sortedItems = [...(plan.plan_items || [])].sort((a, b) => a.title.localeCompare(b.title, 'ko'));

  return (
    <div className="print-page print-page-enhanced print-plan-page">
      <div className="print-shell">
        <div className="hide-print toolbar" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
          <Link className="btn btn-light" href="/plans">계획서로 돌아가기</Link>
          <PrintButton />
        </div>

        <section className="print-cover-block plan-print-hero">
          <div className="print-cover-kicker">MONTHLY MARKETING PLAN</div>
          <h1 className="print-main-title">{plan.brand_name}</h1>
          <div className="print-main-subtitle">{plan.month_label} 월별 마케팅계획서</div>
          <div className="print-highlight-row">
            <div className="print-highlight-card">
              <div className="small muted">계획 항목 수</div>
              <div className="print-highlight-value blue">{sortedItems.length}건</div>
            </div>
            <div className="print-highlight-card">
              <div className="small muted">작성 상태</div>
              <div className="print-highlight-value green">저장 완료</div>
            </div>
            <div className="print-highlight-card">
              <div className="small muted">관리 워크스페이스</div>
              <div className="print-highlight-value amber">POLABS ADMIN</div>
            </div>
          </div>
        </section>

        <div className="subgrid" style={{ marginBottom: 18 }}>
          <div className="subcard print-panel-card">
            <h3>핵심 요약</h3>
            <div className="meta-list">
              <div className="meta-item"><span>브랜드명</span><strong>{plan.brand_name}</strong></div>
              <div className="meta-item"><span>기준 월</span><strong>{plan.month_label}</strong></div>
              <div className="meta-item"><span>계획 항목 수</span><strong>{sortedItems.length}건</strong></div>
              <div className="meta-item"><span>추가 메모</span><strong>{plan.plan_memo?.trim() ? '입력됨' : '없음'}</strong></div>
            </div>
          </div>
          <div className="subcard print-panel-card print-memo-card">
            <h3>월간 운영 메모</h3>
            <div className="print-memo-text" style={{ whiteSpace: 'pre-line' }}>{plan.plan_memo || '입력된 추가 메모가 없습니다.'}</div>
          </div>
        </div>

        <section className="subcard print-panel-card">
          <h3>월별 마케팅 계획 항목</h3>
          {!sortedItems.length ? (
            <div className="empty" style={{ marginTop: 14 }}>입력된 계획 항목이 없습니다.</div>
          ) : (
            <div className="plan-print-list">
              {sortedItems.map((item, index) => (
                <article className="plan-print-item" key={`${item.title}-${index}`}>
                  <div className="plan-print-index">{String(index + 1).padStart(2, '0')}</div>
                  <div>
                    <div className="plan-line-title">{item.title}</div>
                    <div className="desc" style={{ whiteSpace: 'pre-line' }}>{item.note || '비고 없음'}</div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
