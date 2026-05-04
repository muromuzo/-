# PO LABS 월별 성과 템플릿

Vercel + Supabase 기준으로 바로 배포 가능한 Next.js 템플릿입니다.

## 핵심 기능
- 회원가입 / 로그인
- 관리자 권한 부여
- 최고 마스터 계정 자동 생성
- 월별 성과 입력
- 수수료율 직접 수정
- 총매출에서 매출할인/매출제외 금액 차감
- 전체 마케팅비 항목 자유 입력
- 유입채널별 매출 입력
- PDF 보고서 템플릿 출력

## 최고 마스터 계정
- 아이디: `polabs`
- 비밀번호: `vldhfoqtm1!`

> 배포 후 보안을 위해 반드시 비밀번호를 변경하는 것을 권장합니다.

## 1) Supabase 준비
1. Supabase 프로젝트 생성
2. SQL Editor에서 `sql/schema.sql` 실행
3. Project Settings → API에서 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 복사

## 2) 환경변수 설정
`.env.example`를 `.env.local`로 복사하고 아래 값 입력:

```bash
NEXT_PUBLIC_APP_NAME=PO LABS Monthly Reporting
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
AUTH_SECRET=충분히-긴-랜덤-문자열
MASTER_USERNAME=polabs
MASTER_PASSWORD=vldhfoqtm1!
MASTER_DISPLAY_NAME=PO LABS MASTER
```

## 3) 로컬 실행
```bash
npm install
npm run dev
```

## 4) Vercel 배포
1. GitHub에 업로드
2. Vercel에서 Import Project
3. Environment Variables에 `.env.local` 값 등록
4. Deploy

## 5) PDF 사용 방법
- 보고서 카드에서 `PDF` 버튼 클릭
- 인쇄 화면에서 `PDF 저장 / 인쇄` 클릭
- 브라우저의 `PDF로 저장` 사용

## 참고
- 이 템플릿은 서버 측에서 Supabase service role key를 사용하므로 반드시 Vercel 환경변수에만 저장하세요.
- 추후 기능 확장: 조직별 권한 분리, 이메일 자동 발송, 월별 비교 차트, 병원별 대시보드 분기 처리
