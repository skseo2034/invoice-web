# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 검사
```

shadcn 컴포넌트 추가:
```bash
npx shadcn@latest add <component-name>
```

## 아키텍처

### Route Group 레이아웃 분리
3가지 레이아웃이 Route Group으로 분리되어 URL에 영향을 주지 않는다:

- `(marketing)/` → Header + Footer (공개 페이지, `/`)
- `(app)/` → SidebarProvider + AppSidebar (`/dashboard/**`)
- `(auth)/` → 중앙 정렬 단순 레이아웃 (`/login`, `/register`)

루트 `layout.tsx`는 Header/Footer 없이 전역 Provider만 wrapping:
`ThemeProvider` → `QueryProvider` → `TooltipProvider` → `Toaster`

### 전역 상태 및 Provider
- **테마**: `next-themes` ThemeProvider, `attribute="class"`, `globals.css`의 `@custom-variant dark (&:is(.dark *))` 패턴과 연동
- **서버 상태**: TanStack Query (`staleTime: 60s`, `retry: 1`), 개발환경에서 DevTools 자동 활성화
- **토스트**: Sonner (`position="bottom-right"`, `richColors`)
- **Tooltip**: TooltipProvider를 루트에 배치 (shadcn Tooltip 필수 요건)

### 폼 패턴
`react-hook-form` + `zod` + `@hookform/resolvers` 조합 사용.
스키마는 `src/lib/validations/`에 정의, 타입은 `z.infer<>` 로 추출.

Zod v4 주의: `z.enum()` 에러 커스터마이징은 `errorMap` 대신 `error` 사용.

### 데이터 페칭 패턴
서버 컴포넌트(`page.tsx`)에서 초기 렌더링, 클라이언트 데이터 페칭은 별도 파일로 분리:
- `page.tsx` → 서버 컴포넌트 (레이아웃, 초기 UI)
- `dataset-list.tsx`, `settings-forms.tsx` → `"use client"` 클라이언트 컴포넌트

### 공통 규칙
- 경로 별칭: `@/*` → `src/*`
- 스타일 유틸: `src/lib/utils.ts`의 `cn()` (clsx + tailwind-merge)
- 상수: `src/constants/index.ts` (SITE_CONFIG, NAV_ITEMS, SIDEBAR_ITEMS 등)
- 타입: `src/types/index.ts` (NavItem, Feature, TechBadge, Theme, SiteConfig)
- 들여쓰기: Tab (width 4)
