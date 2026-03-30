import type { Metadata } from "next"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { notion } from "@/lib/notion"
import { InvoiceDetail } from "./invoice-detail"

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>
}): Promise<Metadata> {
	try {
		const { id } = await params
		const page = await notion.pages.retrieve({ page_id: id }) as PageObjectResponse
		const props = page.properties as Record<string, Record<string, unknown>>
		const titleProp = props["견적번호"]
		const titleArr = (titleProp?.title ?? []) as Array<{ plain_text: string }>
		const invoiceNumber = titleArr.map((t) => t.plain_text).join("")

		if (invoiceNumber) {
			return { title: `${invoiceNumber} | 견적서 시스템` }
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
