"use client"

import { useQuery } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"
import Link from "next/link"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InvoiceStatusBadge } from "@/components/common/status-badge"
import { DASHBOARD_STAT_CONFIG } from "@/constants"
import { formatKRW, formatDate } from "@/lib/format"
import type { DashboardStats } from "@/types"

async function fetchStats(): Promise<DashboardStats> {
	const res = await fetch("/api/invoices/stats")
	if (!res.ok) {
		const body = await res.json().catch(() => ({}))
		throw new Error(body.error ?? "통계를 불러오는데 실패했습니다")
	}
	return res.json()
}

// 통계 값 포맷팅
function formatStatValue(key: string, value: number, isCurrency?: boolean): string {
	if (isCurrency) return formatKRW(value)
	return `${value}건`
}

export function DashboardContent() {
	const {
		data: stats,
		isPending,
		isError,
		error,
		refetch,
		isFetching,
	} = useQuery({
		queryKey: ["invoices", "stats"],
		queryFn: fetchStats,
		staleTime: 60_000,
	})

	if (isPending) {
		return (
			<div className="flex flex-col gap-6 p-6">
				{/* 통계 카드 스켈레톤 */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Card key={i}>
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<Skeleton className="h-4 w-16" />
								<Skeleton className="size-4" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-7 w-20" />
							</CardContent>
						</Card>
					))}
				</div>
				{/* 최근 견적서 스켈레톤 */}
				<Card>
					<CardHeader>
						<Skeleton className="h-5 w-24" />
						<Skeleton className="h-4 w-40" />
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{Array.from({ length: 5 }).map((_, i) => (
								<Skeleton key={i} className="h-10 w-full" />
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	if (isError) {
		return (
			<div className="p-6">
				<Alert variant="destructive">
					<AlertDescription className="flex items-center justify-between">
						<span>{error?.message ?? "통계를 불러오는데 실패했습니다"}</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => refetch()}
							disabled={isFetching}
						>
							<RefreshCw className={`size-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
							재시도
						</Button>
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	// 통계 값 매핑
	const statValues: Record<string, number> = {
		total: stats.total,
		sent: stats.sent,
		approved: stats.approved,
		totalAmount: stats.totalAmount,
	}

	return (
		<div className="flex flex-col gap-6 p-6">
			{/* 통계 카드 그리드 */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{DASHBOARD_STAT_CONFIG.map((config) => {
					const Icon = config.icon
					const value = statValues[config.key] ?? 0
					return (
						<Card key={config.key}>
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardDescription>{config.label}</CardDescription>
								<Icon className="size-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{formatStatValue(config.key, value, config.isCurrency)}
								</div>
							</CardContent>
						</Card>
					)
				})}
			</div>

			{/* 최근 견적서 테이블 */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle className="text-base">최근 견적서</CardTitle>
						<CardDescription>최근 발행된 견적서 5건입니다.</CardDescription>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => refetch()}
						disabled={isFetching}
					>
						<RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
					</Button>
				</CardHeader>
				<CardContent>
					{stats.recentInvoices.length === 0 ? (
						<p className="text-sm text-muted-foreground text-center py-8">
							견적서가 없습니다.
						</p>
					) : (
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
								{stats.recentInvoices.map((invoice) => (
									<TableRow key={invoice.id}>
										<TableCell className="font-medium">
											<Link
												href={`/invoices/${invoice.id}`}
												className="hover:underline"
											>
												{invoice.invoiceNumber}
											</Link>
										</TableCell>
										<TableCell className="text-muted-foreground">
											{invoice.clientName}
										</TableCell>
										<TableCell>
											<InvoiceStatusBadge status={invoice.status} />
										</TableCell>
										<TableCell className="text-right text-muted-foreground">
											{formatDate(invoice.issueDate)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
