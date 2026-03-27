import type { Metadata } from "next"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/common/page-header"
import { InvoiceStatusBadge } from "@/components/common/status-badge"
import { DASHBOARD_STATS } from "@/constants"
import type { InvoiceStatus } from "@/types"
import Link from "next/link"

export const metadata: Metadata = {
	title: "대시보드",
}

// 최근 견적서 예시 데이터
const RECENT_INVOICES: {
	id: string
	invoiceNumber: string
	clientName: string
	status: InvoiceStatus
	date: string
}[] = [
	{ id: "1", invoiceNumber: "INV-2026-001", clientName: "ABC 주식회사", status: "승인", date: "2026-03-18" },
	{ id: "2", invoiceNumber: "INV-2026-002", clientName: "DEF 디자인", status: "발송", date: "2026-03-17" },
	{ id: "3", invoiceNumber: "INV-2026-003", clientName: "GHI 솔루션", status: "초안", date: "2026-03-15" },
	{ id: "4", invoiceNumber: "INV-2026-004", clientName: "JKL 마케팅", status: "거절", date: "2026-03-12" },
	{ id: "5", invoiceNumber: "INV-2026-005", clientName: "MNO 테크", status: "승인", date: "2026-03-10" },
]

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

			<div className="flex flex-col gap-6 p-6">
				{/* ── 통계 카드 그리드 ─────────────────────── */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{DASHBOARD_STATS.map((stat) => {
						const Icon = stat.icon
						return (
							<Card key={stat.label}>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardDescription>{stat.label}</CardDescription>
									<Icon className="size-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stat.value}</div>
								</CardContent>
							</Card>
						)
					})}
				</div>

				{/* ── 최근 견적서 테이블 ──────────────────── */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">최근 견적서</CardTitle>
						<CardDescription>최근 발행된 견적서 5건입니다.</CardDescription>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>견적번호</TableHead>
									<TableHead>거래처명</TableHead>
									<TableHead>상태</TableHead>
									<TableHead className="text-right">발행일</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{RECENT_INVOICES.map((row) => (
									<TableRow key={row.id}>
										<TableCell className="font-medium">{row.invoiceNumber}</TableCell>
										<TableCell className="text-muted-foreground">
											{row.clientName}
										</TableCell>
										<TableCell>
											<InvoiceStatusBadge status={row.status} />
										</TableCell>
										<TableCell className="text-right text-muted-foreground">
											{row.date}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
