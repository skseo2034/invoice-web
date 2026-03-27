# Development Guidelines

## 프로젝트 개요

- **목적**: 노션 DB를 백엔드로 사용하는 견적서(Invoice) 관리 웹앱
- **기술스택**: Next.js 16, React 19, TypeScript, TanStack Query v5, shadcn/ui, Tailwind CSS v4, Zod v4, react-hook-form, Sonner, @notionhq/client
- **데이터 소스**: Notion Database (환경변수 `NOTION_API_KEY`, `NOTION_DATABASE_ID` 필수)

---

## 프로젝트 아키텍처

### 디렉토리 구조

```
src/
├── app/
│   ├── (marketing)/          # 공개 페이지 (Header+Footer 레이아웃)
│   │   ├── page.tsx          # 랜딩 페이지 (/)
│   │   └── invoices/[id]/    # 견적서 공개 뷰 (/invoices/:id)
│   ├── (app)/                # 인증 필요 페이지 (Sidebar 레이아웃)
│   │   └── dashboard/        # 대시보드 (/dashboard, /dashboard/invoices)
│   ├── api/invoices/         # REST API Route Handlers
│   │   ├── route.ts          # GET /api/invoices
│   │   └── [id]/
│   │       ├── route.ts      # GET /api/invoices/[id]
│   │       └── pdf/route.ts  # GET /api/invoices/[id]/pdf (Phase 2 미구현)
│   ├── layout.tsx            # 루트 레이아웃 (Provider만 포함)
│   └── globals.css
├── components/
│   ├── ui/                   # shadcn/ui 자동생성 컴포넌트 (직접 수정 금지)
│   ├── common/               # 재사용 공통 컴포넌트
│   └── layout/               # 레이아웃 전용 컴포넌트
├── constants/
│   ├── index.ts              # SITE_CONFIG, NAV_ITEMS, SIDEBAR_ITEMS
│   └── invoice.ts            # ISSUER_INFO, INVOICE_STATUS_VARIANT
├── hooks/                    # 커스텀 훅
├── lib/
│   ├── notion.ts             # 노션 클라이언트 싱글턴
│   ├── notion-mapper.ts      # 노션 페이지 → 타입 변환 함수
│   ├── utils.ts              # cn() 유틸
│   └── validations/          # Zod 스키마 (auth.ts, invoice.ts)
└── types/index.ts            # 전역 타입 정의
```

### Route Group 레이아웃 규칙

- `(marketing)/layout.tsx` → Header + Footer 포함
- `(app)/layout.tsx` → SidebarProvider + AppSidebar 포함
- `(auth)/layout.tsx` → 중앙 정렬 단순 레이아웃 (로그인/회원가입용)
- 루트 `layout.tsx` → Provider만 (ThemeProvider → QueryProvider → TooltipProvider → Toaster)

---

## 노션 DB 스키마

### 프로퍼티명 (한국어 - 정확히 일치해야 함)

| 프로퍼티명 | 타입 | 설명 |
|-----------|------|------|
| 견적번호 | title | 견적서 고유 번호 |
| 거래처 | rich_text | 클라이언트명 |
| 거래처 이메일 | email | 클라이언트 이메일 |
| 상태 | select | `초안` \| `발송` \| `승인` \| `거절` |
| 발행일 | date | 견적서 발행일 |
| 마감일 | date | 유효기한 |
| 메모 | rich_text | 추가 메모 |
| 총액 | number | 항목 합계 (부가세 미포함) |

### 견적 항목 구조

- 노션 페이지 본문의 **테이블 블록**으로 저장
- 테이블 컬럼 순서 (인덱스): `항목명[0]`, `설명[1]`, `수량[2]`, `단가[3]`
- 첫 번째 행은 헤더이므로 파싱 시 건너뜀
- `notion-mapper.ts`에서 파싱하지 않음 — `src/app/api/invoices/[id]/route.ts`에서 직접 파싱

---

## 코드 작성 규칙

### 들여쓰기 및 포맷

- **Tab 사용** (spaces 금지), Tab width: 4
- 주석: 한국어로 작성

### 타입 정의

- 모든 전역 타입은 `src/types/index.ts`에 정의
- 로컬 전용 타입은 해당 파일 내에서 정의
- `z.infer<>` 로 Zod 스키마에서 타입 추출

### 컴포넌트 분리 패턴

- `page.tsx` → 서버 컴포넌트 (레이아웃, 초기 UI, props 전달만)
- 클라이언트 로직 → `"use client"` 별도 파일 (예: `invoice-list.tsx`, `invoice-detail.tsx`)
- `page.tsx`에 `"use client"` 추가 금지

### 스타일링

- `cn()` 함수 (`src/lib/utils.ts`) 사용 — clsx + tailwind-merge 조합
- shadcn/ui 컴포넌트 우선 사용
- `src/components/ui/` 파일 직접 수정 금지 (shadcn CLI로만 추가)

---

## 기능 구현 규칙

### API Route Handler 패턴

```typescript
// src/app/api/invoices/route.ts 패턴 준수
import { NextResponse } from "next/server"
import { notion, NOTION_DATABASE_ID } from "@/lib/notion"

export async function GET() {
    try {
        // 노션 API 호출
        return NextResponse.json({ data })
    } catch (error) {
        console.error("오류 메시지:", error)
        return NextResponse.json({ error: "한국어 에러 메시지" }, { status: 500 })
    }
}
```

- Dynamic route params는 `Promise<{ id: string }>` 타입으로 `await params` 사용
- Notion `object_not_found` 에러 → 404 응답

### TanStack Query 데이터 페칭

```typescript
// 클라이언트 컴포넌트에서 사용
const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["invoices"],
    queryFn: fetchInvoices,
    staleTime: 60_000, // 1분 캐시
})
```

- `staleTime: 60_000` 기본값 유지
- 로딩 → `<Skeleton>` 컴포넌트
- 에러 → `<Alert variant="destructive">` + 재시도 버튼
- 빈 목록 → 안내 메시지 표시

### 노션 데이터 매핑

- 노션 → 앱 타입 변환은 반드시 `src/lib/notion-mapper.ts`에서 처리
- 목록 조회용: `mapToInvoiceListItem()` 사용
- 상세 조회용: `mapToInvoice()` 사용
- 새 노션 프로퍼티 매핑 추가 시 `notion-mapper.ts`에만 추가

### 금액 계산 규칙

- `totalAmount` (노션 DB) = 항목 소계 (부가세 미포함)
- 화면 표시 시: `부가세 = Math.round(subtotal * 0.1)`, `합계 = subtotal + tax`
- 금액 포맷팅: `new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" })`

### 견적서 상태 접근 제어

- `초안` 상태 견적서는 공개 뷰(`/invoices/[id]`)에서 접근 차단 (안내 메시지만 표시)
- 상태 배지: `INVOICE_STATUS_VARIANT` 상수 (`src/constants/invoice.ts`)에서 variant 조회

### 발행인 정보

- `ISSUER_INFO` 상수 (`src/constants/invoice.ts`) 참조
- 실제 서비스 운용 시 환경변수 또는 노션 설정 페이지로 이전 예정

---

## Zod 스키마 규칙

- 스키마 파일 위치: `src/lib/validations/`
- **Zod v4** 사용 — `z.enum()` 에러 커스터마이징은 `errorMap` 대신 `error` 파라미터 사용

```typescript
// ❌ 금지 (Zod v3 방식)
z.enum(["초안", "발송"], { errorMap: () => ({ message: "..." }) })

// ✅ 올바른 방식 (Zod v4)
z.enum(["초안", "발송"], { error: "유효하지 않은 상태입니다" })
```

---

## 동시 수정 필요 파일 목록

### Invoice 타입 변경 시

1. `src/types/index.ts` — 타입 정의 수정
2. `src/lib/notion-mapper.ts` — 매핑 함수 수정
3. `src/lib/validations/invoice.ts` — Zod 스키마 수정

### 노션 DB 프로퍼티 추가 시

1. `src/types/index.ts` — `Invoice` 또는 `InvoiceListItem` 타입에 필드 추가
2. `src/lib/notion-mapper.ts` — `mapToInvoice()` 또는 `mapToInvoiceListItem()`에 매핑 추가

### 견적서 상태(`InvoiceStatus`) 변경 시

1. `src/types/index.ts` — `InvoiceStatus` 타입 수정
2. `src/constants/invoice.ts` — `INVOICE_STATUS_VARIANT` 수정
3. `src/lib/notion-mapper.ts` — `extractStatus()` 내 `valid` 배열 수정
4. `src/lib/validations/invoice.ts` — 스키마 수정

### 새 네비게이션 항목 추가 시

1. `src/constants/index.ts` — `NAV_ITEMS` 또는 `SIDEBAR_ITEMS` 수정
2. 해당 레이아웃 컴포넌트 (`src/components/layout/header.tsx`, `app-sidebar.tsx`) 확인

---

## 환경변수 규칙

- 필수 환경변수 (서버 전용):
  - `NOTION_API_KEY` — 노션 통합 API 키
  - `NOTION_DATABASE_ID` — 견적서 노션 DB ID
- 환경변수 참조 파일: `src/lib/notion.ts`
- `.env.local.example` 파일 참조하여 설정
- 환경변수를 클라이언트 컴포넌트에서 직접 사용 금지 (`NEXT_PUBLIC_` 접두사 없는 변수)

---

## 미구현 기능 (Phase 2)

- **PDF 생성**: `src/app/api/invoices/[id]/pdf/route.ts` — 501 응답 반환 중
  - 구현 예정: `puppeteer-core` + `@sparticuz/chromium`
  - 구현 전까지 PDF 다운로드 버튼은 `disabled` 상태 유지

---

## 금지 사항

- `src/components/ui/` 파일 직접 수정 (shadcn CLI: `npx shadcn@latest add <component>` 사용)
- `page.tsx`에 `"use client"` 추가
- 노션 프로퍼티명 영어로 변경 (한국어 프로퍼티명 유지 필수)
- `notion-mapper.ts` 우회하여 컴포넌트에서 직접 노션 응답 파싱
- 클라이언트 컴포넌트에서 `NOTION_API_KEY` 등 서버 전용 환경변수 참조
- `totalAmount` 필드에 부가세 포함하여 저장 (항목 소계만 저장)
- spaces 들여쓰기 사용 (Tab 전용)
