import type { Metadata } from "next"
import { InvoiceDetail } from "./invoice-detail"

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: "견적서 | 견적서 시스템",
	}
}

export default async function InvoicePublicPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	return <InvoiceDetail id={id} />
}
