# PRD: 노션 기반 견적서 웹 시스템

## 1. 한 줄 요약

프리랜서/소규모 사업자가 **노션 데이터베이스에 견적서를 작성**하면, 클라이언트가 **고유 URL로 웹에서 확인하고 PDF로 다운로드**할 수 있는 시스템.

---

## 2. 목표 & Non-goals

### 목표 (Goals)
- 노션 데이터베이스를 단일 데이터 소스(SSOT)로 사용하여 별도 DB 없이 견적서 관리
- 클라이언트가 고유 URL(`/invoices/[id]`)로 견적서를 웹에서 조회
- 견적서를 PDF로 다운로드
- 관리자가 대시보드에서 견적서 목록을 조회

### Non-goals
- 노션 외 별도 데이터베이스 구축 (PostgreSQL, MongoDB 등)
- 웹에서 견적서 작성/편집 (노션에서만 작성)
- 사용자 인증/권한 관리 (MVP에서 제외)
- 결제 연동, 전자서명
- 이메일 자동 발송
- 견적서 버전 관리 / 변경 이력 추적

---

## 3. 사용자 스토리

| # | 스토리 |
|---|--------|
| 1 | As a 관리자, I want to 노션 데이터베이스에 견적서를 입력하면 웹에 자동 반영되길, so that 별도 시스템 없이 견적서를 관리할 수 있다 |
| 2 | As a 클라이언트, I want to 공유받은 URL로 견적서를 확인하길, so that 별도 로그인 없이 견적 내용을 볼 수 있다 |
| 3 | As a 클라이언트, I want to 견적서를 PDF로 다운로드하길, so that 사내 결재나 기록 보관에 활용할 수 있다 |
| 4 | As a 관리자, I want to 대시보드에서 전체 견적서 목록을 보길, so that 발행한 견적서를 한눈에 관리할 수 있다 |
| 5 | As a 관리자, I want to 견적서 상태(초안/발송/승인/거절)를 노션에서 변경하면 웹에 반영되길, so that 현재 진행 상황을 추적할 수 있다 |

---

## 4. 기능 명세

### 4.1 견적서 목록 조회 (관리자 대시보드)

- **경로**: `/dashboard/invoices`
- **입력**: 없음 (페이지 접근)
- **처리**: Notion API로 데이터베이스 전체 조회 → 목록 렌더링
- **출력**: 견적서 번호, 클라이언트명, 금액, 상태, 발행일 테이블
- **엣지 케이스**:
    - 노션 API 응답 지연 → 로딩 스켈레톤 표시
    - API 오류 → 에러 메시지 + 재시도 버튼
    - 견적서 0건 → 빈 상태(empty state) UI

### 4.2 견적서 상세 조회 (클라이언트 공개 페이지)

- **경로**: `/invoices/[id]`
- **입력**: URL 파라미터 `id` (노션 페이지 ID)
- **처리**: Notion API로 해당 페이지 속성 + 하위 블록(항목 테이블) 조회
- **출력**: 견적서 전체 내용 (발행자 정보, 클라이언트 정보, 항목 목록, 합계, 조건)
- **엣지 케이스**:
    - 존재하지 않는 ID → 404 페이지
    - 상태가 "초안"인 견적서 → 접근 차단 또는 "준비 중" 안내
    - 노션 API 오류 → 사용자 친화적 에러 페이지

### 4.3 PDF 다운로드

- **경로**: `/api/invoices/[id]/pdf`
- **입력**: URL 파라미터 `id`
- **처리**: 노션 데이터 조회 → HTML 템플릿 렌더링 → PDF 변환
- **출력**: PDF 파일 다운로드 (`Content-Disposition: attachment`)
- **PDF 생성 방식**: Puppeteer (`@sparticuz/chromium` + `puppeteer-core`)
    - Vercel 배포 시 서버리스 함수에서 동작 가능
    - HTML/CSS로 견적서 레이아웃을 완전 제어
- **엣지 케이스**:
    - PDF 생성 실패 → 500 에러 + toast 알림
    - 긴 항목 목록 → 페이지 넘김 처리 (CSS `break-inside: avoid`)

### 4.4 견적서 링크 복사

- **경로**: 대시보드 목록에서 동작
- **입력**: 견적서 행의 "링크 복사" 버튼 클릭
- **처리**: 클립보드에 공개 URL 복사
- **출력**: toast로 "링크가 복사되었습니다" 표시

---

## 5. 노션 데이터베이스 스키마

### 5.1 견적서 데이터베이스 (메인)

| 속성명 | Notion 타입 | 설명 | 예시 |
|--------|-------------|------|------|
| `견적번호` | Title | 고유 견적서 번호 | `INV-2026-001` |
| `클라이언트명` | Rich Text | 고객사/개인 이름 | `(주)테크컴퍼니` |
| `클라이언트 이메일` | Email | 연락처 | `contact@tech.co` |
| `상태` | Select | 진행 상태 | `초안` / `발송` / `승인` / `거절` |
| `발행일` | Date | 견적서 발행일 | `2026-03-18` |
| `유효기한` | Date | 견적 유효 만료일 | `2026-04-17` |
| `메모` | Rich Text | 비고/특이사항 | `2차 수정 반영` |
| `합계` | Formula / Number | 총 금액 (자동계산 또는 수동) | `3,300,000` |

### 5.2 견적 항목 (Inline Database / 하위 페이지 내 테이블)

견적서 노션 페이지 본문에 **테이블 블록**으로 항목을 관리합니다.

| 열 | 설명 | 예시 |
|----|------|------|
| `항목명` | 서비스/제품 이름 | `웹 디자인` |
| `설명` | 상세 내용 | `메인 페이지 + 서브 3페이지` |
| `수량` | 개수 | `1` |
| `단가` | 개당 가격 | `2,000,000` |
| `금액` | 수량 x 단가 | `2,000,000` |

> **가정**: 견적 항목은 노션 페이지 본문의 `table` 블록으로 관리. Notion API의 `blocks.children.list`로 조회.

### 5.3 발행자 정보

발행자(나) 정보는 자주 변경되지 않으므로 **환경변수 또는 상수 파일**로 관리합니다.

```typescript
// src/constants/invoice.ts
export const ISSUER_INFO = {
    name: "홍길동",
    businessName: "길동 디자인 스튜디오",
    businessNumber: "123-45-67890",    // 사업자등록번호
    address: "서울시 강남구 테헤란로 123",
    email: "hello@gildong.dev",
    phone: "010-1234-5678",
    bankInfo: "국민은행 123456-78-901234 홍길동",
} as const
```

---

## 6. 기술 고려사항

### 6.1 노션 API 연동

**라이브러리**: `@notionhq/client`

```bash
npm install @notionhq/client
```

**환경변수** (`.env.local`):

```
NOTION_API_KEY=secret_xxx
NOTION_INVOICE_DB_ID=xxx
```

**API 래퍼** (`src/lib/notion.ts`):

```typescript
import { Client } from "@notionhq/client"

export const notion = new Client({
    auth: process.env.NOTION_API_KEY,
})

export const INVOICE_DB_ID = process.env.NOTION_INVOICE_DB_ID!
```

**주요 API 호출**:

| 용도 | Notion API | 메서드 |
|------|-----------|--------|
| 견적서 목록 | `databases.query` | `notion.databases.query({ database_id })` |
| 견적서 상세 (속성) | `pages.retrieve` | `notion.pages.retrieve({ page_id })` |
| 견적 항목 (본문 테이블) | `blocks.children.list` | `notion.blocks.children.list({ block_id })` |

### 6.2 라우트 구조

```
src/app/
├── (app)/dashboard/
│   └── invoices/
│       ├── page.tsx                    # 견적서 목록 (서버 컴포넌트)
│       └── invoice-list.tsx            # 클라이언트 컴포넌트 (테이블)
├── (marketing)/
│   └── invoices/
│       └── [id]/
│           ├── page.tsx                # 견적서 공개 상세 (서버 컴포넌트)
│           └── invoice-detail.tsx      # 클라이언트 컴포넌트 (PDF 다운로드 버튼 등)
└── api/
    └── invoices/
        ├── route.ts                    # GET: 견적서 목록 API
        └── [id]/
            ├── route.ts                # GET: 견적서 상세 API
            └── pdf/
                └── route.ts            # GET: PDF 생성 및 다운로드
```

**라우트 그룹 배치 근거**:
- 견적서 목록(`/dashboard/invoices`)은 관리자용이므로 `(app)` 그룹 (사이드바 레이아웃)
- 견적서 공개 페이지(`/invoices/[id]`)는 클라이언트용이므로 `(marketing)` 그룹 (헤더/푸터 레이아웃)

### 6.3 데이터 페칭 패턴

**서버 컴포넌트** (초기 렌더링):
- `/invoices/[id]` 페이지는 서버 컴포넌트에서 노션 API를 직접 호출 (SEO + 빠른 초기 로딩)
- `generateMetadata`로 견적서 번호를 타이틀에 반영

**API Route + TanStack Query** (대시보드):
- `/api/invoices` → 대시보드에서 TanStack Query로 호출
- 목록 새로고침, 상태 필터링 등 클라이언트 인터랙션 지원

```typescript
// src/hooks/use-invoices.ts
export function useInvoices() {
    return useQuery({
        queryKey: ["invoices"],
        queryFn: () => fetch("/api/invoices").then(res => res.json()),
    })
}
```

### 6.4 PDF 생성

**방식**: Puppeteer 서버사이드 렌더링

```bash
npm install puppeteer-core @sparticuz/chromium
```

**흐름**:
1. API Route에서 노션 데이터 조회
2. HTML 문자열로 견적서 템플릿 생성 (인라인 CSS 포함)
3. Puppeteer로 HTML → PDF 변환
4. `Response`로 PDF 바이너리 반환

```typescript
// src/lib/pdf.ts (핵심 로직 요약)
import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"

export async function generateInvoicePdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })
    const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
    })
    await browser.close()
    return Buffer.from(pdf)
}
```

**PDF 템플릿** (`src/lib/invoice-template.ts`):
- 순수 HTML/CSS 문자열을 반환하는 함수
- 인라인 스타일 사용 (외부 CSS 로딩 불필요)
- A4 비율에 맞춘 레이아웃

[결정 필요: Vercel 무료 플랜의 서버리스 함수 실행 시간 제한(10초)에 Puppeteer가 맞을 수 있는지 확인 필요. 안 되면 `@react-pdf/renderer` 또는 외부 서비스(Browserless 등)로 대체]

### 6.5 Zod 스키마

```typescript
// src/lib/validations/invoice.ts
import { z } from "zod"

// 노션에서 가져온 데이터를 파싱/검증하는 스키마
export const invoiceItemSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    amount: z.number().min(0),
})

export const invoiceSchema = z.object({
    id: z.string(),
    invoiceNumber: z.string(),
    clientName: z.string(),
    clientEmail: z.string().email().optional(),
    status: z.enum(["초안", "발송", "승인", "거절"]),
    issueDate: z.string(),
    dueDate: z.string().optional(),
    memo: z.string().optional(),
    items: z.array(invoiceItemSchema),
    totalAmount: z.number(),
})

export type Invoice = z.infer<typeof invoiceSchema>
export type InvoiceItem = z.infer<typeof invoiceItemSchema>
```

### 6.6 노션 데이터 → 앱 타입 변환

```typescript
// src/lib/notion-mapper.ts
// Notion API 응답을 Invoice 타입으로 변환하는 매퍼 함수
// - 속성 타입별 값 추출 (title, rich_text, select, date, number 등)
// - 테이블 블록 파싱하여 InvoiceItem[] 생성
// - invoiceSchema.parse()로 런타임 검증
```

---

## 7. UI/UX 요구사항

### 7.1 화면 목록

| 화면 | 경로 | 레이아웃 | 설명 |
|------|------|----------|------|
| 견적서 목록 | `/dashboard/invoices` | `(app)` 사이드바 | 관리자용 테이블 |
| 견적서 상세 | `/invoices/[id]` | `(marketing)` 헤더/푸터 | 클라이언트 공개 페이지 |
| 404 | `/invoices/[id]` (없는 ID) | `(marketing)` | 존재하지 않는 견적서 |

### 7.2 견적서 목록 (`/dashboard/invoices`)

- shadcn `Table` 컴포넌트 사용
- 컬럼: 견적번호, 클라이언트명, 금액(원화 포맷), 상태(Badge), 발행일, 액션
- 액션: "보기" (새 탭으로 공개 페이지 열기), "링크 복사" (클립보드), "PDF 다운로드"
- 상태별 Badge 색상: 초안(gray), 발송(blue), 승인(green), 거절(red)
- 로딩 시 `Skeleton` 표시, 에러 시 재시도 UI

### 7.3 견적서 상세 (`/invoices/[id]`)

- 깔끔하고 인쇄 친화적인 디자인 (흰색 배경, 적절한 여백)
- 상단: 발행자 로고/정보 + 견적번호/날짜
- 중단: 클라이언트 정보
- 본문: 항목 테이블 (항목명, 설명, 수량, 단가, 금액)
- 하단: 소계, 부가세(10%), 합계
- 푸터: 결제 정보, 유효기한, 메모
- 우측 상단 또는 하단: "PDF 다운로드" 버튼 (shadcn `Button`)
- 다크모드에서도 견적서 본문은 **밝은 배경** 유지 (인쇄 미리보기 느낌)

### 7.4 주요 인터랙션

- PDF 다운로드 클릭 → 로딩 스피너 → 다운로드 시작 → toast("다운로드가 시작되었습니다")
- 링크 복사 → toast("링크가 복사되었습니다")
- 상태 Badge 클릭 → 아무 동작 없음 (노션에서만 변경, 읽기 전용)

---

## 8. 완료 기준 (Definition of Done)

- [ ] 노션 데이터베이스 생성 및 샘플 견적서 3건 이상 입력
- [ ] `/dashboard/invoices`에서 노션 DB의 견적서 목록이 테이블로 표시됨
- [ ] `/invoices/[id]`에서 견적서 상세 내용이 렌더링됨
- [ ] 견적 항목 테이블(항목명, 수량, 단가, 금액)이 정상 표시됨
- [ ] 소계, 부가세(10%), 합계가 정확히 계산되어 표시됨
- [ ] PDF 다운로드 버튼 클릭 시 A4 규격 PDF가 다운로드됨
- [ ] PDF 내용이 웹 페이지와 동일함
- [ ] 존재하지 않는 견적서 ID 접근 시 404 페이지 표시
- [ ] "초안" 상태 견적서는 공개 페이지에서 접근 불가
- [ ] 견적서 공개 URL 복사 기능 동작
- [ ] 모바일 반응형 레이아웃 적용
- [ ] 로딩/에러 상태 UI 구현

---

## 9. 개발 우선순위 & 단계

### Phase 1 - MVP (핵심 기능)

1. **노션 API 연동 기초**: `@notionhq/client` 설치, 환경변수 설정, API 래퍼 작성
2. **데이터 매퍼**: 노션 응답 → `Invoice` 타입 변환 함수
3. **견적서 상세 페이지** (`/invoices/[id]`): 서버 컴포넌트로 구현
4. **PDF 생성 API** (`/api/invoices/[id]/pdf`): Puppeteer 기반
5. **견적서 목록 대시보드** (`/dashboard/invoices`): 기본 테이블

### Phase 2 - 편의 기능

- 상태별 필터링 / 정렬
- 견적서 검색 (클라이언트명, 견적번호)
- 링크 복사 기능
- 금액 포맷팅 (원화, 천 단위 콤마)
- 견적서 상세 페이지 인쇄 최적화 (`@media print`)

### Phase 3 - 향후 고려

- 관리자 인증 (NextAuth.js)
- 견적서 → 청구서 전환
- 이메일 발송 (Resend)
- 견적서 템플릿 커스터마이징
- 다국어 / 다통화 지원
- 노션 Webhook으로 실시간 동기화
