# 코드 패턴 상세 노트

## 확인된 Good Patterns

### QueryProvider useState 패턴
```tsx
const [queryClient] = useState(() => new QueryClient({ ... }))
```
- 서버/클라이언트 인스턴스 공유 방지를 위해 올바르게 사용

### ThemeToggle mounted 패턴
- SSR hydration mismatch 방지를 위해 mounted 상태 체크 후 렌더링
- 마운트 전 동일 크기 placeholder 버튼 렌더로 레이아웃 shift 방지

### TanStack Query staleTime 설정
- 전역 defaultOptions: staleTime 60s
- DatasetList 개별 쿼리: staleTime 30s (더 짧게 오버라이드)
- isFetching으로 백그라운드 페칭도 UI에 반영

### zod v4 error 파라미터
- settings.ts에서 `z.enum(["ko", "en"], { error: "..." })` 올바르게 적용

## 발견된 Anti-Patterns

### 1. StatusBadge 중복 (DRY 위반)
파일: dashboard/page.tsx, dashboard/users/page.tsx, dataset-list.tsx
- 3개 파일에 유사하지만 약간씩 다른 StatusBadge 정의
- dataset-list.tsx의 StatusBadge만 Union 타입 사용 (가장 안전)

### 2. 랜딩 페이지 전체 클라이언트화
파일: (marketing)/page.tsx
- toast 핸들러 하나 때문에 "use client" 선언
- 정적 콘텐츠(기능 카드, 기술스택 목록)까지 모두 클라이언트 번들에 포함

### 3. 컴포넌트 내부 컴포넌트 정의
파일: settings-forms.tsx (NotificationSettingsForm 내부 SwitchField)
- 렌더마다 새 함수 참조 생성

### 4. 들여쓰기 불일치
파일: src/lib/utils.ts, src/hooks/use-mobile.ts
- shadcn 생성 파일로 추정, 공백 2칸 사용 (프로젝트 규칙: 탭)

### 5. SiteConfig 타입 미적용
파일: src/constants/index.ts
- SITE_CONFIG는 `as const`만 사용, SiteConfig 타입 미적용

### 6. NavItem.external 미사용 필드
- Header와 Footer 모두 external 필드를 실제 렌더링에 반영하지 않음
- 외부 링크가 새 탭으로 열리지 않을 수 있음
