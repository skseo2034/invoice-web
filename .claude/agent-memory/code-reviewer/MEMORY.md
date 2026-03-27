# 코드 리뷰어 메모리: claude-nextjs-starters

## 프로젝트 스택 (확인 완료)
- Next.js 16.1.6, React 19.2.3, TypeScript 5 (strict)
- Tailwind CSS v4, shadcn/ui new-york, neutral 베이스
- zod ^4.3.6, react-hook-form ^7.71.2, @hookform/resolvers ^5.2.2
- @tanstack/react-query ^5.90.21
- 패키지 매니저: npm

## 반복 발견 패턴

### [주의] StatusBadge 중복 정의
- `dashboard/page.tsx`와 `dashboard/users/page.tsx`, `dataset-list.tsx`에
  StatusBadge 컴포넌트가 각각 별도로 정의됨 (DRY 위반)
- 개선 방안: `src/components/common/status-badge.tsx`로 추출 권장

### [주의] 랜딩 페이지 "use client" 불필요 확장
- `(marketing)/page.tsx`가 "use client"인데, toast 핸들러 하나 때문에 전체가 클라이언트 컴포넌트화됨
- 서버 컴포넌트로 분리 후 토스트 버튼만 별도 클라이언트 컴포넌트로 추출 권장

### [주의] utils.ts 들여쓰기 탭 미적용
- `src/lib/utils.ts`는 공백(2칸) 들여쓰기 사용 (탭 규칙 위반)
- 프로젝트 컨벤션은 탭(width 4) 사용

### [주의] use-mobile.ts 들여쓰기 탭 미적용
- shadcn 자동 생성 파일이지만 공백(2칸) 사용 (탭 규칙 위반)

### [정보] SiteConfig 타입 미사용
- `src/types/index.ts`에 SiteConfig 인터페이스 정의되어 있으나
  `src/constants/index.ts`의 SITE_CONFIG에 타입이 적용되지 않음

### [정보] NavItem.external 필드 미사용
- `NavItem` 타입에 `external?: boolean` 있으나 실제 렌더링 로직에서 미사용

### [정보] Footer.tsx 서버 컴포넌트에서 new Date() 사용
- 빌드 시 정적으로 고정될 수 있음 (동적 연도가 필요할 경우 고려)

### [정보] settings-forms.tsx SwitchField 렌더 함수 패턴
- NotificationSettingsForm 내부에 SwitchField를 렌더 함수로 정의 (컴포넌트 내부 컴포넌트)
- 매 렌더마다 새 참조 생성 → 외부 컴포넌트로 추출 권장

## 아키텍처 규칙 준수 확인
- Route Group 레이아웃 분리: 정상 (marketing/app/auth)
- Root layout Provider 순서: ThemeProvider > QueryProvider > TooltipProvider > Toaster (정상)
- 서버/클라이언트 컴포넌트 분리: 대체로 정상
- @/* 경로 별칭: 전체 준수
- Zod v4 error 파라미터: settings.ts에서 정상 적용

## 세부 리뷰 파일
- [패턴 상세](./patterns.md)
