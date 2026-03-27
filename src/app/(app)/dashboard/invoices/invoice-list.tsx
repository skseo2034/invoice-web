"use client"

import { useQuery } from "@tanstack/react-query"
import { RefreshCw, ExternalLink, Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import type { InvoiceListItem } from "@/types"
import { getDummyInvoiceList } from "@/lib/dummy-data"

// 원화 포맷팅
function formatKRW(amount: number): string {
	return new Intl.NumberFormat("ko-KR", {
		style: "currency",
		currency: "KRW",
	}).format(amount)
}

// 날짜 포맷팅
function formatDate(dateStr: string): string {
	if (!dateStr) return "-"
	return new Date(dateStr).toLocaleDateString("ko-KR")
}

async function fetchInvoices(): Promise<InvoiceListItem[]> {
	return getDummyInvoiceList()
}

// 링크 복사 핸들러
function handleCopyLink(id: string) {
	const url = `${window.location.origin}/invoices/${id}`
	navigator.clipboard.writeText(url)
	toast.success("링크가 복사되었습니다")
}

export function InvoiceList() {
	const {
		data: invoices,
		isPending,
		isError,
		error,
		refetch,
		isFetching,
	} = useQuery({
		queryKey: ["invoices"],
		queryFn: fetchInvoices,
		staleTime: 60_000,
	})

	if (isPending) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>견적서 목록</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} className="h-12 w-full" />
						))}
					</div>
				</CardContent>
			</Card>
		)
	}

	if (isError) {
		return (
			<Alert variant="destructive">
				<AlertDescription className="flex items-center justify-between">
					<span>{error?.message ?? "견적서를 불러오는데 실패했습니다"}</span>
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
		)
	}

	if (!invoices?.length) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
					<p className="text-sm">견적서가 없습니다.</p>
					<p className="text-xs mt-1">새 견적서를 추가해주세요.</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>견적서 목록</CardTitle>
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
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>견적번호</TableHead>
							<TableHead>거래처명</TableHead>
							<TableHead className="text-right">금액</TableHead>
							<TableHead>상태</TableHead>
							<TableHead>발행일</TableHead>
							<TableHead className="text-right">액션</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{invoices.map((invoice) => (
							<TableRow key={invoice.id}>
								<TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
								<TableCell>{invoice.clientName}</TableCell>
								<TableCell className="text-right">{formatKRW(invoice.totalAmount)}</TableCell>
								<TableCell>
									<InvoiceStatusBadge status={invoice.status} />
								</TableCell>
								<TableCell>{formatDate(invoice.issueDate)}</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end gap-2">
										<Button
											variant="ghost"
											size="icon"
											asChild
										>
											<a
												href={`/invoices/${invoice.id}`}
												target="_blank"
												rel="noopener noreferrer"
												aria-label="견적서 보기"
											>
												<ExternalLink className="size-4" />
											</a>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleCopyLink(invoice.id)}
											aria-label="링크 복사"
										>
											<Copy className="size-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}
