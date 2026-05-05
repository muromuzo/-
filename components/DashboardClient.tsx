'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import AppTabs from '@/components/AppTabs';
import type { BoardPost, DashboardUser, MonthlyPlanRecord, ReportRecord, ScheduleMemo } from '@/lib/types';

type Props = {
  user: DashboardUser;
  recentReports: ReportRecord[];
  recentPlans: MonthlyPlanRecord[];
  recentPosts: BoardPost[];
  weeklySchedules: ScheduleMemo[];
};

function won(value: number) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  });
}

export default function DashboardClient({ user, recentReports, recentPlans, recentPosts, weeklySchedules }: Props) {
  const groupedWeeklySchedules = useMemo(() => {
    const map = new Map<string, ScheduleMemo[]>();
    weeklySchedules.forEach((memo) => {
      const key = memo.owner_pro_name || '미지정 팀';
      const bucket = map.get(key) || [];
      bucket.push(memo);
      map.set(key, bucket);
    });

    return Array.from(map.entries())
      .map(([teamName, memos]) => ({
        teamName,
        memos: [...memos].sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
      }))
      .sort((a, b) => a.teamName.localeCompare(b.teamName, 'ko'));
  }, [weeklySchedules]);

  const reportTotal = recentReports.length;
  const planTotal = recentPlans.length;
  const boardTotal = recentPosts.length;
  const weeklyTotal = weeklySchedules.length;

  return (
    <div className="container">
      <AppTabs
        user={user}
        active="home"
        description="메인 화면에서는 월별 보고서 현황, 월별 계획서 현황, 최신 게시판, 팀별 주간 일정 메모를 한 번에 확인할 수 있습니다."
      />

      <section className="panel overview-kpis">
        <div className="mini-stat">
          <div className="mini-stat-label">월별 보고서 현황</div>
          <div className="mini-stat-value blue">{reportTotal}건</div>
          <p>저장 완료된 최신 보고서 최대 10건을 메인에서 바로 확인합니다.</p>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-label">월별 계획서 현황</div>
          <div className="mini-stat-value green">{planTotal}건</div>
          <p>저장 완료된 최신 계획서 최대 10건을 메인에서 바로 확인합니다.</p>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-label">사내 게시판 최신 글</div>
          <div className="mini-stat-value amber">{boardTotal}건</div>
          <p>프로 이상 작성 권한을 유지하면서 최근 5개 글 제목을 노출합니다.</p>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-label">이번 주 팀 일정</div>
          <div className="mini-stat-value pink">{weeklyTotal}건</div>
          <p>마스터는 프로별로, 프로·일반은 자신의 팀 기준으로 주간 메모를 봅니다.</p>
        </div>
      </section>

      <div className="grid-2">
        <section className="panel">
          <div className="section-title">
            <div>
              <h2>월별 보고서 현황</h2>
              <p className="desc">저장 완료된 성과보고서만 최신순으로 최대 10개까지 표시합니다.</p>
            </div>
            <Link className="btn btn-light" href="/reports">성과보고서 탭 열기</Link>
          </div>

          {!recentReports.length ? (
            <div className="empty">아직 저장된 성과보고서가 없습니다.</div>
          ) : (
            <div className="status-stack">
              {recentReports.map((report) => (
                <article className="status-item" key={report.id}>
                  <div className="status-item-top">
                    <div>
                      <strong>{report.brand_name}</strong>
                      <div className="muted small">{report.month_label}</div>
                    </div>
                    <span className="badge badge-green">저장완료</span>
                  </div>
                  <div className="status-item-grid">
                    <div>
                      <div className="mini-stat-label">정산대상 매출</div>
                      <div className="status-item-value blue">{won(report.adjusted_revenue)}</div>
                    </div>
                    <div>
                      <div className="mini-stat-label">수수료</div>
                      <div className="status-item-value pink">{won(report.fee_amount)}</div>
                    </div>
                  </div>
                  <div className="status-item-actions">
                    <span className="muted small">등록일 {new Date(report.created_at).toLocaleDateString('ko-KR')}</span>
                    <Link className="section-link" href={`/report/${report.id}/print`} target="_blank">PDF 보기</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="section-title">
            <div>
              <h2>월별 계획서 현황</h2>
              <p className="desc">저장 완료된 월별 마케팅계획서를 최신순으로 최대 10개까지 표시합니다.</p>
            </div>
            <Link className="btn btn-light" href="/plans">계획서 탭 열기</Link>
          </div>

          {!recentPlans.length ? (
            <div className="empty">아직 저장된 계획서가 없습니다.</div>
          ) : (
            <div className="status-stack">
              {recentPlans.map((plan) => (
                <article className="status-item" key={plan.id}>
                  <div className="status-item-top">
                    <div>
                      <strong>{plan.brand_name}</strong>
                      <div className="muted small">{plan.month_label}</div>
                    </div>
                    <span className="badge badge-blue">저장완료</span>
                  </div>
                  <div className="status-item-grid">
                    <div>
                      <div className="mini-stat-label">계획 항목 수</div>
                      <div className="status-item-value green">{plan.plan_items?.length || 0}건</div>
                    </div>
                    <div>
                      <div className="mini-stat-label">추가 메모</div>
                      <div className="status-item-snippet">{plan.plan_memo?.trim() ? plan.plan_memo : '추가 메모 없음'}</div>
                    </div>
                  </div>
                  <div className="status-item-actions">
                    <span className="muted small">등록일 {new Date(plan.created_at).toLocaleDateString('ko-KR')}</span>
                    <Link className="section-link" href={`/plan/${plan.id}/print`} target="_blank">PDF 보기</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid-2">
        <section className="panel">
          <div className="section-title">
            <h2>사내 게시판 최신 5개</h2>
            <Link className="btn btn-light" href="/board">게시판 이동</Link>
          </div>
          {!recentPosts.length ? (
            <div className="empty">아직 등록된 게시글이 없습니다.</div>
          ) : (
            <div className="simple-list">
              {recentPosts.map((post) => (
                <Link key={post.id} href="/board" className="simple-list-item">
                  <div>
                    <strong>{post.title}</strong>
                    <span>{post.author_name} · {new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <span>열기</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="section-title">
            <h2>이번 주 일정 메모</h2>
            <Link className="btn btn-light" href="/schedule">일정 탭 이동</Link>
          </div>

          {!groupedWeeklySchedules.length ? (
            <div className="empty">이번 주에 등록된 일정 메모가 없습니다.</div>
          ) : (
            <div className="team-groups">
              {groupedWeeklySchedules.map((group) => (
                <section className="team-group" key={group.teamName}>
                  <div className="team-group-head">
                    <h3>{user.role === 'master' ? `${group.teamName} 일정` : '우리 팀 일정'}</h3>
                    <span className="badge badge-amber">{group.memos.length}건</span>
                  </div>
                  <div className="simple-list">
                    {group.memos.map((memo) => (
                      <Link key={memo.id} href="/schedule" className="simple-list-item schedule-mini-item">
                        <div>
                          <strong>{memo.title}</strong>
                          <span>{memo.category} · 작성자 {memo.author_name}</span>
                        </div>
                        <span>{formatDate(memo.scheduled_date)}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
