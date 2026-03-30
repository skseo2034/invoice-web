# 노션 기반 견적서 웹 시스템 개발 로드맵

프리랜서/소규모 사업자가 노션 데이터베이스에 견적서를 작성하면, 클라이언트가 고유 URL로 웹에서 확인하고 PDF로 다운로드할 수 있는 시스템.

## 개요

| 항목 | 내용 |
|------|------|
| **프로젝트 목표** | 노션 DB를 단일 데이터 소스(SSOT)로 활용한 견적서 관리 및 공유 시스템 |
| **예상 기간** | 6-8주 (Phase 1-3 기준) |
| **현재 날짜** | 2026-03-30 |
| **버전** | 1.3.0 |

**노션 견적서 웹 시스템**은 프리랜서/소규모 사업자를 위한 견적서 관리 도구로 다음 기능을 제공합니다:

- **견적서 목록 조회**: 관리자 대시보드에서 전체 견적서를 테이블로 확인
- **견적서 상세 공개**: 클라이언트에게 고유 URL로 견적서 내용 공유
- **PDF 다운로드**: 견적서를 A4 규격 PDF로 생성 및 다운로드
- **노션 연동**: 노션에서 작성한 견적서가 별도 작업 없이 웹에 자동 반영

## 기술 스택

- **프론트엔드**: Next.js 16 (App Router), TypeScript, React 19, TanStack Query
- **UI**: shadcn/ui, Tailwind CSS 4, Lucide Icons
- **폼/검증**: react-hook-form + Zod v4 + @hookform/resolvers
- **데이터 소스**: Notion API (`@notionhq/client`)
- **PDF 생성**: Puppeteer (`puppeteer-core` + `@sparticuz/chromium`)
- **인프라**: Vercel (예정)

## MVP 정의

**MVP 포함 기능**:
- [x] 노션 API 연동 (클라이언트, 매퍼, 환경변수)
- [x] 견적서 목록 대시보드 (`/dashboard/invoices`)
- [x] 견적서 상세 공개 페이지 (`/invoices/[id]`)
- [x] PDF 생성 및 다운로드 (`/api/invoices/[id]/pdf`)
- [x] 견적서 링크 복사 기능
- [x] "초안" 상태 견적서 접근 차단
- [x] 로딩/에러 상태 UI (Skeleton, 재시도)

**MVP 제외 기능 (향후 고려)**:
- 관리자 인증 (NextAuth.js)
- 상태별 필터링 / 검색
- 견적서 -> 청구서 전환
- 이메일 자동 발송 (Resend)
- 견적서 템플릿 커스터마이징
- 다국어 / 다통화 지원
- 노션 Webhook 실시간 동기화

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `001-setup.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - **API/비즈니스 로직 작업 시 구현 전에 `## 테스트 시나리오` 섹션을 먼저 작성**
     - 테스트 시나리오 구성:
       - Happy Path: 정상 동작 시나리오 (기대 결과 명시)
       - Edge Case: 경계값/특수 상황 시나리오
       - Error Case: 오류 상황, 네트워크 오류, 폴백 UI 확인
   - `/tasks` 디렉토리의 마지막 완료된 작업을 예시로 참조
   - 신규 작업 파일은 빈 체크박스와 변경 사항 요약 없이 작성

3. **작업 구현 (구현 -> 테스트 -> 통과 -> 다음 단계)**
   - 작업 파일의 명세서를 따름
   - **각 구현 단계마다 즉시 Playwright MCP 테스트 실행** (몰아서 하지 않음)
   - 테스트 실행 절차:
     1. 구현 단계 완료
     2. `## 테스트 시나리오`의 해당 시나리오 Playwright MCP로 실행
     3. 실패 시 -> 재구현 후 재테스트 (통과할 때까지 반복)
     4. 통과 확인 후 -> 다음 단계 진행
   - 각 단계 완료 후 작업 파일 내 체크박스 업데이트
   - **모든 시나리오 통과 전까지 작업을 완료로 표시하지 않음**
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 ✅로 표시

## 개발 단계

### Phase 1: 애플리케이션 골격 구축 ✅

> **목표**: 전체 앱 구조와 빈 껍데기를 먼저 완성하여 병렬 작업 기반 마련
> **완료 기준**: 모든 라우트 접근 가능, 타입 정의 완료, 공통 레이아웃 동작

- **Task 001: 프로젝트 초기 설정 및 라우트 구조** ✅ - 완료
  - ✅ Next.js App Router 기반 Route Group 구조 생성 (`(marketing)`, `(app)`, `(auth)`)
  - ✅ 전체 라우트 파일 생성: `/dashboard/invoices`, `/invoices/[id]`, API 라우트 3개
  - ✅ 루트 레이아웃에 전역 Provider 구성 (ThemeProvider, QueryProvider, TooltipProvider, Toaster)
  - ✅ 사이드바 레이아웃 (`(app)/layout.tsx`) 및 마케팅 레이아웃 (`(marketing)/layout.tsx`) 구현

- **Task 002: 타입 정의 및 상수 설계** ✅ - 완료
  - ✅ TypeScript 인터페이스 정의 (`Invoice`, `InvoiceItem`, `InvoiceListItem`, `InvoiceStatus`, `IssuerInfo`)
  - ✅ 실제 노션 DB CSV 스키마 반영 재작업 (`InvoiceStatus` "대기" 추가, 필드명 교정, Items Relation 매핑)
  - ✅ 사이트 상수 정의 (`SITE_CONFIG`, `NAV_ITEMS`, `SIDEBAR_ITEMS`, `DASHBOARD_STATS`)
  - ✅ 발행인 정보 상수 파일 (`src/constants/invoice.ts`)
  - ✅ Zod 검증 스키마 (`src/lib/validations/invoice.ts`, `auth.ts`)

- **Task 003: 노션 API 연동 기초** ✅ - 완료
  - ✅ `@notionhq/client` 설치 및 클라이언트 싱글턴 구성 (`src/lib/notion.ts`)
  - ✅ 환경변수 설정 (`NOTION_API_KEY`, `NOTION_DATABASE_ID`)
  - ✅ 노션 응답 -> Invoice 타입 변환 매퍼 (`src/lib/notion-mapper.ts`)
  - ✅ API 라우트 골격: 목록 (`/api/invoices`), 상세 (`/api/invoices/[id]`), PDF 플레이스홀더 (`/api/invoices/[id]/pdf`)

### Phase 2: UI/UX 완성 (더미 데이터 활용) ✅

> **목표**: 실제 노션 데이터 기반으로 전체 화면을 완성하여 사용자 플로우 검증
> **완료 기준**: 모든 페이지 UI 완성, 반응형 적용, 네비게이션 동작

- **Task 004: 공통 컴포넌트 구현** ✅ - 완료
  - ✅ shadcn/ui 컴포넌트 설치 (Table, Card, Badge, Skeleton, Alert, Button 등 30개)
  - ✅ 공통 컴포넌트: `PageHeader`, `InvoiceStatusBadge`, `ThemeToggle`, `QueryProvider`
  - ✅ 상태별 Badge 색상 매핑 (초안: gray, 발송: blue, 승인: green, 거절: red)

- **Task 005: 견적서 목록 페이지 UI** ✅ - 완료
  - ✅ 서버 컴포넌트 페이지 (`page.tsx`) + 클라이언트 컴포넌트 (`invoice-list.tsx`) 분리
  - ✅ TanStack Query 기반 데이터 페칭 (`staleTime: 60s`)
  - ✅ 테이블 UI: 견적번호, 거래처명, 금액(원화 포맷), 상태(Badge), 발행일, 액션
  - ✅ 액션 버튼: 견적서 보기 (새 탭), 링크 복사 (클립보드 + toast)
  - ✅ 로딩 스켈레톤, 에러 재시도 UI, 빈 상태(Empty State) UI

- **Task 006: 견적서 상세 공개 페이지 UI** ✅ - 완료
  - ✅ 서버 컴포넌트 페이지 + `InvoiceDetail` 클라이언트 컴포넌트 분리
  - ✅ 인쇄 친화적 디자인 (흰색 배경, 적절한 여백)
  - ✅ 레이아웃: 발행자 정보 -> 발행일/유효기한/상태 -> 거래처 정보 -> 항목 테이블 -> 소계/부가세(10%)/합계 -> 계좌 정보/메모
  - ✅ "초안" 상태 견적서 접근 차단 ("준비 중" 안내 표시)
  - ✅ PDF 다운로드 버튼 (비활성 상태, 플레이스홀더)

### Phase 3: 핵심 기능 완성 (MVP) ✅

> **목표**: PDF 생성 기능 구현 및 남은 MVP 요구사항 완료
> **완료 기준**: PDF 다운로드 동작, 404 처리, 모바일 반응형, E2E 테스트 통과

- **Task 007: PDF 생성 API 구현** ✅ - 완료
  - ✅ Puppeteer 의존성 설치 (`puppeteer-core`, `@sparticuz/chromium`)
  - ✅ `/api/invoices/[id]/pdf` 라우트 핸들러 구현
  - ✅ 노션 데이터 조회 -> HTML 템플릿 렌더링 -> Puppeteer PDF 변환
  - ✅ A4 규격 PDF 생성 (`Content-Disposition: attachment` 헤더)
  - ✅ 견적서 상세 페이지와 동일한 디자인의 HTML 템플릿 작성
  - ✅ 긴 항목 목록 페이지 넘김 처리 (CSS `break-inside: avoid`)
  - ✅ PDF 생성 실패 시 500 에러 응답 처리
  - ✅ Playwright MCP로 PDF 다운로드 E2E 테스트

- **Task 008: PDF 다운로드 버튼 활성화** ✅ - 완료
  - ✅ 견적서 상세 페이지 (`invoice-detail.tsx`) PDF 다운로드 버튼 활성화
  - ✅ 대시보드 목록 (`invoice-list.tsx`)에 PDF 다운로드 액션 버튼 추가
  - ✅ 다운로드 진행 중 로딩 상태 표시
  - ✅ 다운로드 실패 시 toast 에러 알림

- **Task 009: 404 페이지 및 에러 처리 강화** ✅ - 완료
  - ✅ 존재하지 않는 견적서 ID 접근 시 커스텀 404 페이지 표시
  - ✅ `generateMetadata`에서 견적서 번호를 페이지 타이틀에 반영
  - ✅ 노션 API 오류 시 사용자 친화적 에러 페이지
  - ✅ Playwright MCP로 404 및 에러 시나리오 테스트

- **Task 010: 모바일 반응형 최적화** ✅ - 완료
  - ✅ 견적서 목록 테이블 모바일 레이아웃 (카드형 또는 스크롤 테이블)
  - ✅ 견적서 상세 페이지 모바일 여백 및 폰트 사이즈 조정
  - ✅ 대시보드 사이드바 모바일 대응 확인
  - ✅ 주요 브레이크포인트 (sm, md, lg) 에서 레이아웃 검증

- **Task 010-1: MVP 통합 테스트** ✅ - 완료
  - ✅ Playwright MCP를 사용한 전체 사용자 플로우 테스트
  - ✅ 견적서 목록 조회 -> 상세 보기 -> PDF 다운로드 플로우 검증
  - ✅ 링크 복사 기능 동작 확인
  - ✅ 초안 상태 접근 차단 검증
  - ✅ 로딩/에러 상태 UI 동작 확인

### Phase 4: 편의 기능 (Post-MVP)

> **목표**: 사용자 편의 기능 추가 및 관리 효율성 향상
> **완료 기준**: 필터/검색 동작, 인쇄 최적화, 금액 포맷 일관성

- **Task 011: 상태별 필터링 및 정렬**
  - 견적서 목록에 상태 필터 드롭다운 추가 (전체/초안/발송/승인/거절)
  - 발행일, 금액 기준 정렬 토글
  - TanStack Query `queryKey`에 필터 파라미터 반영
  - API 라우트에 필터/정렬 쿼리 파라미터 처리

- **Task 012: 견적서 검색**
  - 클라이언트명, 견적번호 기반 검색 입력 필드
  - 디바운스 적용 (300ms)
  - 검색 결과 없음 UI 처리

- **Task 013: 인쇄 최적화**
  - `@media print` 스타일 적용 (헤더/푸터/네비게이션 숨김)
  - 견적서 상세 페이지 인쇄 레이아웃 최적화
  - 브라우저 인쇄 버튼 추가

- **Task 014: 대시보드 통계 카드 연동**
  - 대시보드 메인 페이지 (`/dashboard`) 통계 카드에 실제 데이터 연동
  - 전체 견적서 수, 발송/승인 건수, 총 금액 표시
  - API 엔드포인트 추가 또는 목록 API 확장

### Phase 5: 고급 기능 및 프로덕션 (향후 고려)

> **목표**: 보안, 확장성, 운영 안정성 확보
> **완료 기준**: 인증 시스템 구축, CI/CD 파이프라인, 모니터링

- **Task 015: 관리자 인증 시스템**
  - NextAuth.js 기반 관리자 인증 구현
  - 대시보드 라우트 보호 미들웨어
  - 로그인/로그아웃 UI (`(auth)` 레이아웃 활용)

- **Task 016: 성능 최적화**
  - 노션 API 응답 캐싱 전략 (ISR 또는 Route Handler 캐시)
  - 이미지 최적화 (Next.js Image)
  - Bundle 사이즈 분석 및 최적화

- **Task 017: 배포 및 CI/CD**
  - Vercel 배포 설정
  - 환경변수 관리 (Production / Preview)
  - GitHub Actions 기반 CI 파이프라인 (lint, build, test)

- **Task 018: 향후 확장 기능**
  - 견적서 -> 청구서 전환 기능
  - 이메일 발송 (Resend)
  - 견적서 템플릿 커스터마이징
  - 다국어 / 다통화 지원
  - 노션 Webhook 실시간 동기화

## 리스크 관리

| 리스크 | 영향도 | 발생 가능성 | 완화 전략 |
|--------|--------|-------------|----------|
| 노션 API Rate Limit (3 req/s) | 높음 | 중간 | 서버 사이드 캐싱, ISR 적용, 요청 최소화 |
| Puppeteer 서버리스 호환성 | 높음 | 중간 | `@sparticuz/chromium` 사용, Vercel 함수 메모리/타임아웃 설정 |
| 노션 API 응답 구조 변경 | 중간 | 낮음 | Zod 스키마로 런타임 검증, 매퍼 계층 분리 |
| PDF 렌더링 불일치 | 중간 | 중간 | 웹 페이지와 동일한 HTML/CSS 템플릿 공유, E2E 테스트 |
| 노션 API 응답 지연 | 중간 | 중간 | Skeleton UI, 타임아웃 설정, 재시도 로직 (TanStack Query retry) |

## 의존성 맵

- **외부 서비스**:
  - Notion API: 견적서 데이터 CRUD의 유일한 데이터 소스
  - Vercel: 배포 플랫폼 (Serverless Functions, Edge Network)

- **핵심 라이브러리 의존성**:
  - `@notionhq/client` v5: 노션 API 클라이언트
  - `puppeteer-core` + `@sparticuz/chromium`: PDF 생성 (Task 007에서 설치)

- **기술적 전제조건**:
  - 노션 데이터베이스 생성 및 API Integration 설정 완료
  - 샘플 견적서 3건 이상 입력 (테스트용)
  - 환경변수 `.env.local` 설정 (`NOTION_API_KEY`, `NOTION_DATABASE_ID`)

## 성공 지표 (KPI)

- **기능 완료율**: Phase별 Task 완료 비율 추적
- **성능 목표**: 페이지 로드 < 2초, API 응답 < 500ms (노션 API 경유 특성 반영)
- **PDF 생성**: PDF 생성 시간 < 5초, A4 규격 준수
- **품질 지표**: E2E 테스트 통과율 100%, 에러율 < 0.1%
- **사용자 경험**: 모바일/데스크톱 반응형 완전 지원, 로딩/에러 상태 100% 커버

## 기술 부채 및 개선 사항

- `formatKRW`, `formatDate` 유틸 함수가 `invoice-list.tsx`와 `invoice-detail.tsx`에 중복 정의됨 -> 공통 유틸로 추출 필요
- API 라우트에서 노션 API 호출 시 타임아웃 처리 미적용
- `notion-mapper.ts`에서 `as` 타입 단언 다수 사용 -> Zod 런타임 검증으로 개선 필요
- ~~PDF API 라우트가 501 플레이스홀더 상태~~ -> Task 007에서 구현 완료
- ~~`generateMetadata`에서 견적서 번호 동적 반영 미구현~~ -> Task 009에서 구현 완료

## 가정 사항

- 노션 데이터베이스의 프로퍼티명은 실제 CSV에서 확인된 한국어 이름을 사용 (`견적서번호`, `클라이언트명`, `총금액`, `유효기간`, `항목`, `항목명`, `수량`, `단가`, `금액`)
- 발행인(나) 정보는 환경변수가 아닌 상수 파일(`src/constants/invoice.ts`)로 관리
- 부가세는 소계의 10%로 고정 계산 (견적서 상세 페이지에서 클라이언트 사이드 계산)
- MVP에서 인증은 제외하며, 대시보드는 누구나 접근 가능
- PDF 생성은 서버 사이드 Puppeteer 방식으로, Vercel Serverless Functions에서 실행

## 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 2026-03-22 | 1.0.0 | 초기 작성 - PRD 분석 및 현재 코드베이스 상태 반영 | AI 아키텍트 |
| 2026-03-23 | 1.0.1 | 개발 워크플로우 테스트 정책 강화 (Playwright MCP 필수화) | AI 아키텍트 |
| 2026-03-25 | 1.1.0 | Task 002 재작업 - 실제 노션 DB CSV 스키마 반영 (InvoiceStatus "대기" 추가, 필드명 교정, Items Relation 조회 방식 전환) | AI 아키텍트 |
| 2026-03-27 | 1.2.0 | Task 004, 005, 006 완료 표시 - Phase 2 UI/UX 완성 | AI 아키텍트 |
| 2026-03-30 | 1.3.0 | Task 007~010-1 완료 표시 - Phase 3 MVP 완성, 기술 부채 2건 해소 | AI 아키텍트 |
