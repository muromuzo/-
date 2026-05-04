# PO LABS 월별 리포팅 템플릿 배포 가이드

## 1) 소스 업로드
압축을 해제한 뒤 GitHub 저장소에 업로드하고, Vercel에서 Import 합니다.

## 2) Vercel 환경변수
아래 값을 프로젝트 Settings > Environment Variables 에 추가하세요.

```env
NEXT_PUBLIC_APP_NAME=PO LABS Monthly Reporting
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxx
AUTH_SECRET=change-this-to-a-long-random-secret
MASTER_USERNAME=polabs
MASTER_PASSWORD=vldhfoqtm1!
MASTER_DISPLAY_NAME=PO LABS MASTER
```

## 3) Supabase SQL 실행
`sql/schema.sql` 내용을 Supabase SQL Editor에서 실행하세요.

### 이미 예전 스키마를 실행한 경우
이번 버전부터 `savings_items` 테이블이 추가되었습니다. 기존 프로젝트라면 아래 SQL만 별도로 1회 실행해도 됩니다.

```sql
create table if not exists public.savings_items (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.monthly_reports(id) on delete cascade,
  name text not null,
  value bigint not null default 0,
  created_at timestamptz not null default now()
);
```

## 4) Redeploy
환경변수를 저장했거나 SQL을 추가한 뒤에는 Vercel에서 Redeploy 하세요.

## 5) 로그인
최초 배포 후 아래 마스터 계정으로 로그인한 뒤 비밀번호를 즉시 변경하세요.
- ID: `polabs`
- PW: `vldhfoqtm1!`

## 이번 버전 추가 기능
- 월 마케팅비 절감 내역 입력 섹션 추가
- 항목 / 금액 공란 행 추가 가능
- 월별 카드에 절감 합계 표시
- PDF 보고서에도 절감 내역 자동 삽입
