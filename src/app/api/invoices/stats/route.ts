import { NextResponse } from "next/server"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { NOTION_DATABASE_ID, queryDatabase } from "@/lib/notion"
import { mapToInvoiceListItem } from "@/lib/notion-mapper"
import type { DashboardStats, InvoiceListItem } from "@/types"

// GET /api/invoices/stats - 대시보드 통계 조회
export async function GET() {
	try {
		const response = await queryDatabase(NOTION_DATABASE_ID, {
			sorts: [{ property: "발행일", direction: "descending" }],
		})

		const invoices: InvoiceListItem[] = response.results
			.filter((page: PageObjectResponse) => page.object === "page")
			.map((page: PageObjectResponse) => mapToInvoiceListItem(page))

		// 서버에서 통계 집계
		const stats: DashboardStats = {
			total: invoices.length,
			sent: invoices.filter((inv) => inv.status === "발송").length,
			approved: invoices.filter((inv) => inv.status === "승인").length,
			totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
			recentInvoices: invoices.slice(0, 5),
		}

		return NextResponse.json(stats)
	} catch (error) {
		console.error("대시보드 통계 조회 실패:", error)
		return NextResponse.json(
			{ error: "통계를 불러오는데 실패했습니다" },
			{ status: 500 }
		)
	}
}
