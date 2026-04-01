import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/common/page-header"
import Link from "next/link"

// 대시보드 콘텐츠 레이지 로딩
const DashboardContent = dynamic(
	() => import("./dashboard-content").then((mod) => ({ default: mod.DashboardContent })),
	{
		loading: () => (
			<div className="space-y-4 p-6">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-32 w-full" />
				</div>
				<Skeleton className="h-64 w-full" />
			</div>
		),
	}
)

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
