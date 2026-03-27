---
name: invoice-web 프로젝트 기반 정보
description: 노션 기반 견적서 웹 시스템의 아키텍처 결정 및 주요 설정 사항
type: project
---

이 프로젝트는 Next.js App Router 기반 노션 연동 견적서 관리 시스템이다.

**Why:** 노션 데이터베이스를 백엔드로 활용해 별도 서버 없이 견적서를 관리하고 클라이언트에게 공유 링크를 발송하는 목적으로 구축됨.

**How to apply:** 데이터 레이어 관련 제안 시 항상 Notion API v5 (`@notionhq/client` v5) 기준으로 안내. `databases.query`는 존재하지 않고 `dataSources.query(data_source_id, ...)` 를 사용해야 함.

## 핵심 구조 결정

- Route Group 3분리: `(marketing)/` (공개 페이지, 헤더+푸터), `(app)/` (대시보드, 사이드바), `(auth)/`는 삭제됨 (인증 없는 구조)
- 견적서 공개 URL: `/invoices/[id]` → `(marketing)` 라우트 그룹 (Header+Footer 포함)
- 견적서 관리 URL: `/dashboard/invoices` → `(app)` 라우트 그룹 (Sidebar 포함)
- 초안 상태 견적서는 공개 페이지에서 접근 차단

## @notionhq/client v5 주의사항

- `notion.databases.query()` 없음 → `notion.dataSources.query({ data_source_id, sorts, filter })`
- 환경변수: `NOTION_API_KEY`, `NOTION_DATABASE_ID`
- 노션 DB 컬럼명 (한국어): 견적번호, 거래처, 거래처 이메일, 상태, 발행일, 마감일, 메모, 총액
- 상태 select 값: 초안 | 발송 | 승인 | 거절

## 견적서 항목 파싱 방식

노션 페이지 본문의 Table 블록을 파싱. `blocks.children.list(page_id)` → table 블록 찾기 → `blocks.children.list(table_id)` → table_row 순회 (첫 행=헤더 skip) → cells[0]=항목명, cells[1]=설명, cells[2]=수량, cells[3]=단가

## 발행인 정보

`src/constants/invoice.ts`의 `ISSUER_INFO`에 하드코딩. 추후 환경변수 또는 노션 설정 페이지로 이전 예정.

## PDF 기능

Phase 2에서 puppeteer-core + @sparticuz/chromium으로 구현 예정. 현재 `/api/invoices/[id]/pdf` 라우트는 501 반환.
