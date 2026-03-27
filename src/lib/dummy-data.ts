import type { Invoice, InvoiceListItem } from "@/types"

// 더미 견적서 데이터 (상태별 5개)
export const DUMMY_INVOICES: Invoice[] = [
	{
		id: "inv-001",
		invoiceNumber: "INV-2026-001",
		clientName: "한국소프트웨어 주식회사",
		status: "초안",
		issueDate: "2026-03-01",
		items: [
			{ id: "item-001-1", name: "웹사이트 UI 디자인", quantity: 1, unitPrice: 1500000, amount: 1500000 },
			{ id: "item-001-2", name: "반응형 퍼블리싱", quantity: 1, unitPrice: 800000, amount: 800000 },
		],
		totalAmount: 2300000,
	},
	{
		id: "inv-002",
		invoiceNumber: "INV-2026-002",
		clientName: "스마트테크 코리아",
		status: "대기",
		issueDate: "2026-03-08",
		items: [
			{ id: "item-002-1", name: "모바일 앱 개발 컨설팅", quantity: 2, unitPrice: 500000, amount: 1000000 },
			{ id: "item-002-2", name: "기술 문서 작성", quantity: 1, unitPrice: 300000, amount: 300000 },
			{ id: "item-002-3", name: "코드 리뷰 서비스", quantity: 3, unitPrice: 200000, amount: 600000 },
		],
		totalAmount: 1900000,
	},
	{
		id: "inv-003",
		invoiceNumber: "INV-2026-003",
		clientName: "글로벌 이노베이션 그룹",
		status: "발송",
		issueDate: "2026-03-12",
		validUntil: "2026-04-12",
		items: [
			{ id: "item-003-1", name: "전자상거래 플랫폼 구축", quantity: 1, unitPrice: 5000000, amount: 5000000 },
			{ id: "item-003-2", name: "결제 시스템 연동", quantity: 1, unitPrice: 1200000, amount: 1200000 },
		],
		totalAmount: 6200000,
	},
	{
		id: "inv-004",
		invoiceNumber: "INV-2026-004",
		clientName: "미래산업 주식회사",
		status: "승인",
		issueDate: "2026-03-18",
		validUntil: "2026-04-18",
		items: [
			{ id: "item-004-1", name: "ERP 시스템 커스터마이징", quantity: 1, unitPrice: 3500000, amount: 3500000 },
			{ id: "item-004-2", name: "사용자 교육 및 온보딩", quantity: 5, unitPrice: 150000, amount: 750000 },
			{ id: "item-004-3", name: "유지보수 계약 (6개월)", quantity: 1, unitPrice: 900000, amount: 900000 },
		],
		totalAmount: 5150000,
	},
	{
		id: "inv-005",
		invoiceNumber: "INV-2026-005",
		clientName: "디지털 파트너스",
		status: "거절",
		issueDate: "2026-03-22",
		items: [
			{ id: "item-005-1", name: "브랜드 아이덴티티 디자인", quantity: 1, unitPrice: 2000000, amount: 2000000 },
			{ id: "item-005-2", name: "로고 및 가이드라인 제작", quantity: 1, unitPrice: 500000, amount: 500000 },
		],
		totalAmount: 2500000,
	},
]

// 목록 페이지용 경량 데이터 (DUMMY_INVOICES에서 파생)
export const DUMMY_INVOICE_LIST: InvoiceListItem[] = DUMMY_INVOICES.map(
	({ id, invoiceNumber, clientName, status, issueDate, totalAmount }) => ({
		id,
		invoiceNumber,
		clientName,
		status,
		issueDate,
		totalAmount,
	})
)

// id로 견적서 단건 조회
export function getDummyInvoice(id: string): Invoice | undefined {
	return DUMMY_INVOICES.find((invoice) => invoice.id === id)
}

// 견적서 목록 전체 조회
export function getDummyInvoiceList(): InvoiceListItem[] {
	return DUMMY_INVOICE_LIST
}
