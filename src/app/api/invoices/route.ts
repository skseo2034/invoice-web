import { type NextRequest, NextResponse } from "next/server"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { NOTION_DATABASE_ID, queryDatabase } from "@/lib/notion"
import { mapToInvoiceListItem } from "@/lib/notion-mapper"
import { invoiceListQuerySchema } from "@/lib/validations/invoice"

// sortBy 파라미터를 노션 프로퍼티명으로 변환
const SORT_PROPERTY_MAP: Record<string, string> = {
	issueDate: "발행일",
	totalAmount: "총금액",
}

// GET /api/invoices - 견적서 목록 조회 (필터/정렬 지원)
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = request.nextUrl
		const rawQuery = {
			status: searchParams.get("status") ?? undefined,
			sortBy: searchParams.get("sortBy") ?? undefined,
			sortOrder: searchParams.get("sortOrder") ?? undefined,
		}

		// Zod 검증 (유효하지 않은 값은 무시)
		const parsed = invoiceListQuerySchema.safeParse(rawQuery)
		const query = parsed.success ? parsed.data : {}

		// 노션 API 요청 body 구성
		const body: Record<string, unknown> = {}

		// 필터: 상태 선택 시
		if (query.status) {
			body.filter = {
				property: "상태",
				select: { equals: query.status },
			}
		}

		// 정렬: sortBy가 있으면 해당 프로퍼티로, 없으면 발행일 내림차순
		const sortProperty = query.sortBy
			? SORT_PROPERTY_MAP[query.sortBy]
			: "발행일"
		const sortDirection = query.sortOrder === "asc" ? "ascending" : "descending"
		body.sorts = [{ property: sortProperty, direction: sortDirection }]

		const response = await queryDatabase(NOTION_DATABASE_ID, body)

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
