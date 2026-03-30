// 원화 포맷팅
export function formatKRW(amount: number): string {
	return new Intl.NumberFormat("ko-KR", {
		style: "currency",
		currency: "KRW",
	}).format(amount)
}

// 날짜 포맷팅
export function formatDate(dateStr?: string): string {
	if (!dateStr) return "-"
	return new Date(dateStr).toLocaleDateString("ko-KR")
}
