import type { Metadata } from "next"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { notion } from "@/lib/notion"
import { formatKRW } from "@/lib/format"
import { InvoiceDetail } from "./invoice-detail"

// 노션 프로퍼티에서 텍스트 추출 헬퍼
function extractText(prop: Record<string, unknown> | undefined): string {
	if (!prop) return ""
	if (prop.type === "title") {
		const arr = (prop.title ?? []) as Array<{ plain_text: string }>
		return arr.map((t) => t.plain_text).join("")
	}
	if (prop.type === "rich_text") {
		const arr = (prop.rich_text ?? []) as Array<{ plain_text: string }>
		return arr.map((t) => t.plain_text).join("")
	}
	return ""
}

function extractNumber(prop: Record<string, unknown> | undefined): number {
	if (!prop || prop.type !== "number") return 0
	return (prop.number as number) ?? 0
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>
}): Promise<Metadata> {
	try {
		const { id } = await params
		const page = await notion.pages.retrieve({ page_id: id }) as PageObjectResponse
		const props = page.properties as Record<string, Record<string, unknown>>

		const invoiceNumber = extractText(props["견적서번호"]) || extractText(props["견적번호"])
		const clientName = extractText(props["클라이언트명"])
		const totalAmount = extractNumber(props["총금액"])

		if (invoiceNumber) {
			const title = `견적서 ${invoiceNumber} | 견적서 시스템`
			const description = clientName
				? `${clientName} - ${formatKRW(totalAmount)}`
				: `견적서 ${invoiceNumber}`

			return {
				title,
				description,
				openGraph: {
					title,
					description,
					type: "website",
				},
			}
		}
	} catch {
		// 조회 실패 시 기본 타이틀 반환
	}
	return { title: "견적서 | 견적서 시스템" }
}

export default async function InvoicePublicPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	return <InvoiceDetail id={id} />
}
