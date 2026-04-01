// 견적서 공개 URL 생성
export function getInvoiceUrl(id: string): string {
	return `${typeof window !== "undefined" ? window.location.origin : ""}/invoices/${id}`
}

// 표시용 축약 URL (origin 제외, 경로만)
export function getInvoiceShortPath(id: string): string {
	return `/invoices/${id.slice(0, 8)}...`
}
