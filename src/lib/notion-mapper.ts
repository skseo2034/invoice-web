import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import type { Invoice, InvoiceItem, InvoiceListItem, InvoiceStatus } from "@/types"

// 노션 프로퍼티 타입 (내부 유틸용 느슨한 타입)
type NotionProp = Record<string, unknown>

// rich_text 프로퍼티에서 plain text 추출
function extractText(prop: NotionProp | undefined): string {
	if (!prop) return ""
	if (prop.type === "rich_text") {
		const rt = prop.rich_text as Array<{ plain_text: string }>
		return rt?.map((t) => t.plain_text).join("") ?? ""
	}
	if (prop.type === "title") {
		const title = prop.title as Array<{ plain_text: string }>
		return title?.map((t) => t.plain_text).join("") ?? ""
	}
	if (prop.type === "email") {
		return (prop.email as string) ?? ""
	}
	return ""
}

// number 프로퍼티에서 숫자 추출
function extractNumber(prop: NotionProp | undefined): number {
	if (!prop || prop.type !== "number") return 0
	return (prop.number as number) ?? 0
}

// select 프로퍼티에서 상태값 추출
function extractStatus(prop: NotionProp | undefined): InvoiceStatus {
	const valid: InvoiceStatus[] = ["초안", "대기", "발송", "승인", "거절"]
	const select = prop?.select as { name: string } | undefined
	const value = select?.name
	return value && valid.includes(value as InvoiceStatus) ? (value as InvoiceStatus) : "대기"
}

// date 프로퍼티에서 날짜 문자열 추출 (YYYY-MM-DD)
function extractDate(prop: NotionProp | undefined): string | undefined {
	if (!prop || prop.type !== "date") return undefined
	const date = prop.date as { start: string } | null
	return date?.start ?? undefined
}

// 노션 페이지 → InvoiceListItem (목록 조회용)
export function mapToInvoiceListItem(page: PageObjectResponse): InvoiceListItem {
	const props = page.properties as Record<string, NotionProp>
	return {
		id: page.id,
		invoiceNumber: extractText(props["견적서번호"]),
		clientName: extractText(props["클라이언트명"]),
		status: extractStatus(props["상태"]),
		issueDate: extractDate(props["발행일"]) ?? "",
		totalAmount: extractNumber(props["총금액"]),
	}
}

// 노션 페이지 + 항목 배열 → Invoice (상세 조회용)
export function mapToInvoice(page: PageObjectResponse, items: InvoiceItem[]): Invoice {
	const props = page.properties as Record<string, NotionProp>
	return {
		id: page.id,
		invoiceNumber: extractText(props["견적서번호"]),
		clientName: extractText(props["클라이언트명"]),
		status: extractStatus(props["상태"]),
		issueDate: extractDate(props["발행일"]) ?? "",
		validUntil: extractDate(props["유효기간"]),
		items,
		totalAmount: extractNumber(props["총금액"]),
	}
}

// Items DB 페이지 → InvoiceItem 변환
export function mapToInvoiceItem(page: PageObjectResponse): InvoiceItem {
	const props = page.properties as Record<string, NotionProp>
	return {
		id: page.id,
		name: extractText(props["항목명"]),
		quantity: extractNumber(props["수량"]),
		unitPrice: extractNumber(props["단가"]),
		amount: extractNumber(props["금액"]),
	}
}
