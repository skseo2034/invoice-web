import type { Metadata } from "next"
import { PageHeader } from "@/components/common/page-header"
import { InvoiceList } from "./invoice-list"

export const metadata: Metadata = {
	title: "견적서 목록 | 견적서 시스템",
	description: "발행한 견적서 목록을 조회합니다.",
}

export default function InvoicesPage() {
	return (
		<div className="flex flex-col">
			<PageHeader
				title="견적서"
				description="노션 데이터베이스에서 견적서를 조회합니다."
			/>
			<div className="p-6">
				<InvoiceList />
			</div>
		</div>
	)
}
