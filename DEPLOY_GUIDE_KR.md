# PO LABS 월별 성과 템플릿 - 실전 적용 가이드

## 포함 기능
- 회원가입 / 로그인
- 관리자 권한 부여
- 최고 마스터 계정 자동 생성
- 브랜드/병원별 월간 성과 입력
- 수수료율 직접 수정
- 총매출에서 매출할인/매출제외 금액 차감
- 마케팅비 항목 자유 입력
- 유입채널별 매출 자유 입력
- PDF 보고서 출력 페이지 제공

## 최고 마스터 계정
- 아이디: polabs
- 비밀번호: vldhfoqtm1!

> 실제 운영 전 최초 로그인 후 비밀번호를 변경하는 것을 권장합니다.

---

## 1. Supabase 준비
1) https://supabase.com 접속 후 새 프로젝트 생성
2) SQL Editor 열기
3) 프로젝트의 `sql/schema.sql` 내용을 그대로 실행
4) Project Settings > API 에서 아래 값 복사
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY

---

## 2. Vercel 배포 준비
1) ZIP 압축 해제
2) GitHub 새 저장소 생성
3) 압축 해제한 프로젝트 파일 전체 업로드
4) Vercel에서 해당 GitHub 저장소 Import

---

## 3. Vercel 환경변수 등록
Vercel Project Settings > Environment Variables 에 아래 값 입력

- NEXT_PUBLIC_APP_NAME = PO LABS Monthly Reporting
- SUPABASE_URL = (Supabase URL)
- SUPABASE_SERVICE_ROLE_KEY = (Supabase Service Role Key)
- AUTH_SECRET = 충분히 긴 랜덤 문자열
- MASTER_USERNAME = polabs
- MASTER_PASSWORD = vldhfoqtm1!
- MASTER_DISPLAY_NAME = PO LABS MASTER

---

## 4. 배포 후 첫 실행
1) 배포 URL 접속
2) 최초 접속 시 master 계정 자동 생성 시도
3) 아래 계정으로 로그인
   - polabs / vldhfoqtm1!
4) 관리자 페이지에서 다른 직원 계정 권한(admin/user) 부여

---

## 5. 사용 흐름
1) 회원가입 또는 관리자 계정 생성
2) 대시보드에서
   - 병원명/브랜드명
   - 기준 월
   - 총매출
   - 매출할인/제외 금액
   - 기준매출
   - 수수료율
   - 마케팅비 항목
   - 유입채널별 매출
   - 운영 메모
   입력
3) 저장
4) 카드에서 PDF 버튼 클릭
5) 인쇄 화면에서 브라우저의 'PDF로 저장' 사용
6) 병원/거래처별 보고서 전달

---

## 6. 추천 운영 방식
- 직원: user 또는 admin 계정 사용
- 대표/최고관리자: master 계정 유지
- 병원별 월간 보고는 브랜드명 + 월 기준으로 입력
- PDF는 병원 전달용, 대시보드는 내부 관리용으로 사용

---

## 7. 실전 적용 후 바로 추가하면 좋은 기능
- 병원별 필터
- 전월 대비 자동 비교 그래프
- 조직/팀 단위 권한 분리
- 이메일 자동 발송
- 담당자별 거래처 구분
- 업종별 템플릿 프리셋
