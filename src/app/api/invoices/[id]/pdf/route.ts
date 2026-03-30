import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { generateInvoiceHTML } from "@/lib/pdf-template"
import { ISSUER_INFO } from "@/constants/invoice"
import { notion } from "@/lib/notion"
import { mapToInvoice, mapToInvoiceItem } from "@/lib/notion-mapper"
import type { Invoice } from "@/types"

// 노션 API로 견적서 조회
async function fetchInvoice(id: string): Promise<Invoice | null> {
	const page = await notion.pages.retrieve({ page_id: id }) as PageObjectResponse
	const props = page.properties as Record<string, Record<string, unknown>>
	const itemRelations = (props["항목"]?.relation ?? []) as Array<{ id: string }>
	const itemPages = await Promise.all(
		itemRelations.map(({ id: itemId }) =>
			notion.pages.retrieve({ page_id: itemId }) as Promise<PageObjectResponse>
		)
	)
	const items = itemPages.map(mapToInvoiceItem)
	return mapToInvoice(page, items)
}

// Puppeteer로 HTML → PDF 변환
async function generatePDF(html: string): Promise<Buffer> {
	const chromium = (await import("@sparticuz/chromium")).default
	const puppeteer = (await import("puppeteer-core")).default

	const browser = await puppeteer.launch({
		args: chromium.args,
		executablePath: process.env.CHROMIUM_PATH ?? await chromium.executablePath(),
		headless: true,
	})

	try {
		const page = await browser.newPage()
		await page.setContent(html, { waitUntil: "networkidle0" })
		const pdf = await page.pdf({
			format: "A4",
			printBackground: true,
			margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
		})
		return Buffer.from(pdf)
	} finally {
		await browser.close()
	}
}

// GET /api/invoices/[id]/pdf - PDF 생성 및 다운로드
export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params

		const invoice = await fetchInvoice(id)
		if (!invoice) {
			return new Response("견적서를 찾을 수 없습니다", { status: 404 })
		}

		// 초안 상태 견적서는 PDF 생성 불가
		if (invoice.status === "초안") {
			return new Response("초안 상태의 견적서는 PDF를 생성할 수 없습니다", { status: 403 })
		}

		const html = generateInvoiceHTML(invoice, ISSUER_INFO)
		const pdfBuffer = await generatePDF(html)

		return new Response(new Uint8Array(pdfBuffer), {
			status: 200,
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
				"Content-Length": String(pdfBuffer.length),
			},
		})
	} catch (error: unknown) {
		console.error("PDF 생성 실패:", error)

		if (
			typeof error === "object" &&
			error !== null &&
			"code" in error &&
			(error as { code: string }).code === "object_not_found"
		) {
			return new Response("견적서를 찾을 수 없습니다", { status: 404 })
		}

		return new Response("PDF 생성에 실패했습니다", { status: 500 })
	}
}
