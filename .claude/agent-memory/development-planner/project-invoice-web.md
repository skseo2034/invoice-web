---
name: invoice-web 프로젝트 상태
description: 노션 기반 견적서 웹 시스템의 현재 개발 상태 및 아키텍처 요약
type: project
---

노션 기반 견적서 웹 시스템 (invoice-web) - 2026-03-22 기준 현재 상태 분석

**Phase 1 (골격) + Phase 2 (UI)**: 완료
- Route Group 구조 완성: (marketing), (app), (auth)
- 타입 정의 완료: Invoice, InvoiceItem, InvoiceListItem, InvoiceStatus, IssuerInfo
- 노션 API 연동 완료: 클라이언트, 매퍼, API 라우트 (목록/상세)
- UI 완성: 견적서 목록 (TanStack Query), 상세 페이지 (인쇄 친화적 디자인)
- shadcn/ui 컴포넌트 30개 설치 완료

**Phase 3 (핵심 기능)**: 미완료
- PDF 생성 API가 501 플레이스홀더 상태 (puppeteer 미설치)
- 404 커스텀 페이지 미구현
- generateMetadata 동적 반영 미구현
- 모바일 반응형 최적화 미완료

**기술 부채**:
- formatKRW, formatDate 유틸 중복 (invoice-list.tsx, invoice-detail.tsx)
- notion-mapper.ts의 as 타입 단언 -> Zod 검증 필요
- API 타임아웃 처리 미적용

**Why:** 프로젝트 진행 상황을 빠르게 파악하기 위한 참조 문서
**How to apply:** 새로운 작업 시작 전 이 문서를 참조하여 현재 상태 확인
