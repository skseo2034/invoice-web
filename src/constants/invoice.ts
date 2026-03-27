import type { InvoiceStatus, IssuerInfo } from "@/types"

// 발행인 정보 - 실제 운용 시 환경변수 또는 노션 설정 페이지로 이전 가능
export const ISSUER_INFO: IssuerInfo = {
	name: "홍길동",
	businessName: "길동 디자인 스튜디오",
	businessNumber: "123-45-67890",
	address: "서울시 강남구 테헤란로 123",
	email: "hello@gildong.dev",
	phone: "010-1234-5678",
	bankInfo: "국민은행 123456-78-901234 홍길동",
} as const

// 견적서 상태별 배지 variant 매핑
export const INVOICE_STATUS_VARIANT = {
	초안: "secondary",
	대기: "secondary",
	발송: "default",
	승인: "default",
	거절: "destructive",
} as const satisfies Record<InvoiceStatus, "secondary" | "default" | "destructive">
