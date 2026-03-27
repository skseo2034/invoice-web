import { NextResponse } from "next/server"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { notion } from "@/lib/notion"
import { mapToInvoice, mapToInvoiceItem } from "@/lib/notion-mapper"

// GET /api/invoices/[id] - 견적서 상세 조회
export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const page = await notion.pages.retrieve({ page_id: id }) as PageObjectResponse

		// 항목 relation에서 Items DB 페이지 ID 추출 후 병렬 조회
		const props = page.properties as Record<string, Record<string, unknown>>
		const itemRelations = (props["항목"]?.relation ?? []) as Array<{ id: string }>
		const itemPages = await Promise.all(
			itemRelations.map(({ id: itemId }) =>
				notion.pages.retrieve({ page_id: itemId }) as Promise<PageObjectResponse>
			)
		)
		const items = itemPages.map(mapToInvoiceItem)

		const invoice = mapToInvoice(page, items)
		return NextResponse.json({ invoice })
	} catch (error: unknown) {
		console.error("견적서 상세 조회 실패:", error)
		if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "object_not_found") {
			return NextResponse.json({ error: "견적서를 찾을 수 없습니다" }, { status: 404 })
		}
		return NextResponse.json(
			{ error: "견적서를 불러오는데 실패했습니다" },
			{ status: 500 }
		)
	}
}
