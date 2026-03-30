import type { LucideIcon } from "lucide-react"

// 네비게이션 아이템 타입
export interface NavItem {
	label: string
	href: string
	icon?: LucideIcon
	external?: boolean
}

// 테마 타입 (next-themes와 호환)
export type Theme = "light" | "dark" | "system"

// 사이트 설정 타입
export interface SiteConfig {
	name: string
	description: string
	url: string
	version: string
}

// 견적서 상태 타입
export type InvoiceStatus = "초안" | "대기" | "발송" | "승인" | "거절"

// 견적서 항목 타입
export interface InvoiceItem {
	id: string
	name: string
	quantity: number
	unitPrice: number
	amount: number
}

// 견적서 타입 (노션 DB 1 row)
export interface Invoice {
	id: string
	invoiceNumber: string
	clientName: string
	status: InvoiceStatus
	issueDate: string
	validUntil?: string
	items: InvoiceItem[]
	totalAmount: number
}

// 목록 페이지용 경량 타입
export interface InvoiceListItem {
	id: string
	invoiceNumber: string
	clientName: string
	status: InvoiceStatus
	issueDate: string
	totalAmount: number
}

// 대시보드 통계 응답 타입
export interface DashboardStats {
	total: number
	sent: number
	approved: number
	totalAmount: number
	recentInvoices: InvoiceListItem[]
}

// 발행인 정보 타입
export interface IssuerInfo {
	name: string
	businessName: string
	businessNumber: string
	address: string
	email: string
	phone: string
	bankInfo: string
}
