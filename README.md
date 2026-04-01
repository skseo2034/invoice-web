# 노션 기반 견적서 웹 시스템

노션 데이터베이스에 견적서를 작성하면, 클라이언트가 고유 URL로 웹에서 확인하고 PDF로 다운로드할 수 있는 견적서 관리/조회 시스템입니다.

## 주요 기능

- **견적서 조회**: 노션 데이터베이스와 연동된 견적서 목록/상세 조회
- **PDF 다운로드**: Puppeteer 기반 고품질 PDF 생성 및 다운로드
- **관리자 대시보드**: 통계 카드, 견적서 관리, 상태별 현황 확인
- **검색/필터**: 클라이언트명, 견적서 번호 검색 및 상태/날짜 필터링
- **링크 공유**: 견적서별 고유 URL 생성 및 원클릭 복사/공유
- **다크모드**: 라이트/다크/시스템 3가지 테마 모드 지원

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| UI 라이브러리 | React 19, shadcn/ui, Tailwind CSS 4 |
| 서버 상태 | TanStack Query v5 |
| 폼/검증 | react-hook-form + Zod v4 |
| 데이터 소스 | Notion API (`@notionhq/client`) |
| PDF 생성 | Puppeteer (`puppeteer-core` + `@sparticuz/chromium`) |
| 테마 | next-themes |
| 배포 | Vercel |

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local  # 아래 환경변수 설명 참조

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# ESLint 검사
npm run lint
```

## 환경변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `NOTION_API_KEY` | 노션 API 통합 키 | ✅ |
| `NOTION_DATABASE_ID` | 견적서 데이터베이스 ID | ✅ |
| `ADMIN_PASSWORD` | 관리자 로그인 비밀번호 | ✅ |

> `.env.example` 파일을 `.env.local`로 복사한 후 실제 값을 입력하세요.

## 프로젝트 구조

```
src/
├── app/
│   ├── (marketing)/     # 공개 페이지 (Header + Footer 레이아웃)
│   │   └── page.tsx     # 메인 페이지 (/)
│   ├── (app)/           # 관리자 페이지 (Sidebar 레이아웃)
│   │   └── dashboard/   # 대시보드 (/dashboard/**)
│   ├── (auth)/          # 인증 페이지 (중앙 정렬 레이아웃)
│   │   ├── login/       # 로그인 (/login)
│   │   └── register/    # 회원가입 (/register)
│   └── api/             # API 라우트
│       ├── auth/        # 인증 API
│       └── invoices/    # 견적서 API
├── components/          # 공통 및 페이지별 컴포넌트
├── constants/           # 상수 정의
├── lib/                 # 유틸리티, API 클라이언트, 검증 스키마
└── types/               # TypeScript 타입 정의
```

3가지 Route Group으로 레이아웃이 분리되어 있으며, URL에는 영향을 주지 않습니다.

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/invoices` | 견적서 목록 (쿼리: `status`, `sortBy`, `sortOrder`) |
| GET | `/api/invoices/[id]` | 견적서 상세 |
| GET | `/api/invoices/[id]/pdf` | PDF 생성/다운로드 |
| GET | `/api/invoices/stats` | 대시보드 통계 |
| POST | `/api/auth/login` | 관리자 로그인 |
| POST | `/api/auth/logout` | 로그아웃 |

## 배포 (Vercel)

이 프로젝트는 Vercel에 최적화되어 있습니다.

1. [Vercel](https://vercel.com)에 GitHub 리포지토리를 연결합니다.
2. 환경변수(`NOTION_API_KEY`, `NOTION_DATABASE_ID`, `ADMIN_PASSWORD`)를 Vercel 프로젝트 설정에서 추가합니다.
3. 배포가 자동으로 진행됩니다.

> `vercel.json` 설정 파일이 이미 포함되어 있어 Puppeteer PDF 생성을 위한 서버리스 함수 설정이 적용됩니다.

## 라이선스

Private
