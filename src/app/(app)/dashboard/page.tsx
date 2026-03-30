import type { Metadata } from "next"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import { DashboardContent } from "./dashboard-content"
import Link from "next/link"

export const metadata: Metadata = {
	title: "대시보드",
}

export default function DashboardPage() {
	return (
		<div className="flex flex-col">
			{/* 페이지 헤더 */}
			<PageHeader
				title="대시보드"
				description="견적서 현황을 한눈에 확인하세요."
				actions={
					<Button size="sm" className="gap-1.5" asChild>
						<Link href="/dashboard/invoices">
							<FileText className="size-4" />
							견적서 목록
						</Link>
					</Button>
				}
			/>

			{/* 통계 + 최근 견적서 (클라이언트 컴포넌트) */}
			<DashboardContent />
		</div>
	)
}
