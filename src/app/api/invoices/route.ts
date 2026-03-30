import { NextResponse } from "next/server"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { NOTION_DATABASE_ID, queryDatabase } from "@/lib/notion"
import { mapToInvoiceListItem } from "@/lib/notion-mapper"

// GET /api/invoices - 견적서 목록 조회
export async function GET() {
	try {
		const response = await queryDatabase(NOTION_DATABASE_ID, {
			sorts: [{ property: "발행일", direction: "descending" }],
		})

		const invoices = response.results
			.filter((page: PageObjectResponse) => page.object === "page")
			.map((page: PageObjectResponse) => mapToInvoiceListItem(page))

		return NextResponse.json({ invoices })
	} catch (error) {
		console.error("견적서 목록 조회 실패:", error)
		return NextResponse.json(
			{ error: "견적서 목록을 불러오는데 실패했습니다" },
			{ status: 500 }
		)
	}
}
