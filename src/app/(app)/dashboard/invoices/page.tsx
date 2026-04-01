import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/common/page-header"

// 견적서 목록 레이지 로딩
const InvoiceList = dynamic(
	() => import("./invoice-list").then((mod) => ({ default: mod.InvoiceList })),
	{
		loading: () => (
			<div className="space-y-4">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-64 w-full" />
				<Skeleton className="h-10 w-48" />
			</div>
		),
	}
)

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
