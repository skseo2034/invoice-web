import {
	LayoutDashboard,
	FileText,
	Send,
	CheckCircle,
	DollarSign,
} from "lucide-react"
import type { NavItem, SiteConfig } from "@/types"

// 사이트 메타 정보
// satisfies SiteConfig: 타입 검사 + as const 리터럴 타입 추론 동시 적용
export const SITE_CONFIG = {
	name: "견적서 시스템",
	description: "노션 데이터베이스 기반 견적서 관리 시스템",
	url: "https://example.com",
	version: "1.0.0",
} as const satisfies SiteConfig

// 헤더 네비게이션 아이템
export const NAV_ITEMS: NavItem[] = [
	{ label: "홈", href: "/" },
	{ label: "대시보드", href: "/dashboard" },
]

// 사이드바 네비게이션 아이템 (앱 내부)
export const SIDEBAR_ITEMS: NavItem[] = [
	{ label: "대시보드", href: "/dashboard", icon: LayoutDashboard },
	{ label: "견적서", href: "/dashboard/invoices", icon: FileText },
]

// 대시보드 통계 카드 설정 (아이콘/라벨만 정의, 값은 API에서 조회)
export const DASHBOARD_STAT_CONFIG = [
	{ key: "total", label: "전체 견적서", icon: FileText, isCurrency: false },
	{ key: "sent", label: "발송됨", icon: Send, isCurrency: false },
	{ key: "approved", label: "승인됨", icon: CheckCircle, isCurrency: false },
	{ key: "totalAmount", label: "총 금액", icon: DollarSign, isCurrency: true },
] as const
