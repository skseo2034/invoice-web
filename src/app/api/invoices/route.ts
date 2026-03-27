import { NextResponse } from "next/server"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { notion, NOTION_DATABASE_ID } from "@/lib/notion"
import { mapToInvoiceListItem } from "@/lib/notion-mapper"

// GET /api/invoices - 견적서 목록 조회
export async function GET() {
	try {
		const response = await notion.dataSources.query({
			data_source_id: NOTION_DATABASE_ID,
			sorts: [{ property: "발행일", direction: "descending" }],
		})

		const invoices = response.results
			.filter((page): page is PageObjectResponse => page.object === "page")
			.map(mapToInvoiceListItem)

		return NextResponse.json({ invoices })
	} catch (error) {
		console.error("견적서 목록 조회 실패:", error)
		return NextResponse.json(
			{ error: "견적서 목록을 불러오는데 실패했습니다" },
			{ status: 500 }
		)
	}
}
