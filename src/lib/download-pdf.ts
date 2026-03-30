import { toast } from "sonner"

// PDF 다운로드 유틸리티
export async function downloadInvoicePdf(
	invoiceId: string,
	invoiceNumber: string
): Promise<void> {
	const res = await fetch(`/api/invoices/${invoiceId}/pdf`)

	if (!res.ok) {
		const message = await res.text().catch(() => "PDF 다운로드에 실패했습니다")
		throw new Error(message)
	}

	const blob = await res.blob()
	const url = URL.createObjectURL(blob)
	const a = document.createElement("a")
	a.href = url
	a.download = `${invoiceNumber}.pdf`
	a.click()
	URL.revokeObjectURL(url)
}

// PDF 다운로드 핸들러 (로딩 상태 콜백 포함)
export async function handlePdfDownload(
	invoiceId: string,
	invoiceNumber: string,
	setLoading: (v: boolean) => void
): Promise<void> {
	setLoading(true)
	try {
		await downloadInvoicePdf(invoiceId, invoiceNumber)
	} catch (error) {
		toast.error(
			error instanceof Error ? error.message : "PDF 다운로드에 실패했습니다"
		)
	} finally {
		setLoading(false)
	}
}
