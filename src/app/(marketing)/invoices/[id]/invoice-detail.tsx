"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Download, RefreshCw, FileEdit, Clock, Send, CheckCircle, XCircle, Loader2, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InvoiceStatusBadge } from "@/components/common/status-badge"
import { ISSUER_INFO } from "@/constants/invoice"
import { handlePdfDownload } from "@/lib/download-pdf"
import { formatKRW, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Invoice, InvoiceStatus } from "@/types"

async function fetchInvoice(id: string): Promise<Invoice> {
	const res = await fetch(`/api/invoices/${id}`)
	if (!res.ok) {
		const body = await res.json().catch(() => ({}))
		throw new Error(body.error ?? "견적서를 불러오는데 실패했습니다")
	}
	const { invoice } = await res.json()
	return invoice
}

// 상태별 배너 설정
const STATUS_BANNER_CONFIG: Record<
	InvoiceStatus,
	{
		icon: React.ElementType
		message: string
		className: string
		iconClassName: string
	}
> = {
	초안: {
		icon: FileEdit,
		message: "작성 중인 견적서입니다. 검토 후 발송해주세요.",
		className: "bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300",
		iconClassName: "text-slate-500 dark:text-slate-400",
	},
	대기: {
		icon: Clock,
		message: "상대방의 확인을 기다리고 있습니다.",
		className: "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-300",
		iconClassName: "text-amber-500 dark:text-amber-400",
	},
	발송: {
		icon: Send,
		message: "견적서가 발송되었습니다.",
		className: "bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300",
		iconClassName: "text-blue-500 dark:text-blue-400",
	},
	승인: {
		icon: CheckCircle,
		message: "견적서가 승인되었습니다.",
		className: "bg-green-50 border-green-300 text-green-800 dark:bg-green-950 dark:border-green-700 dark:text-green-300",
		iconClassName: "text-green-500 dark:text-green-400",
	},
	거절: {
		icon: XCircle,
		message: "견적서가 거절되었습니다.",
		className: "bg-red-50 border-red-300 text-red-800 dark:bg-red-950 dark:border-red-700 dark:text-red-300",
		iconClassName: "text-red-500 dark:text-red-400",
	},
}

interface InvoiceDetailProps {
	id: string
}

export function InvoiceDetail({ id }: InvoiceDetailProps) {
	const [isDownloading, setIsDownloading] = useState(false)
	const { data: invoice, isPending, isError, error, refetch } = useQuery({
		queryKey: ["invoice", id],
		queryFn: () => fetchInvoice(id),
		staleTime: 60_000,
	})

	if (isPending) {
		return (
			<div className="max-w-4xl mx-auto py-8 px-4 md:px-8 space-y-6">
				{/* 상단 액션 영역 스켈레톤 */}
				<div className="flex justify-between items-center">
					<Skeleton className="h-6 w-32 rounded-full" />
					<Skeleton className="h-9 w-40" />
				</div>
				{/* 상태 배너 스켈레톤 */}
				<Skeleton className="h-12 w-full rounded-lg" />
				{/* 견적서 본문 스켈레톤 */}
				<div className="rounded-lg border p-10 space-y-8">
					{/* 헤더 */}
					<div className="flex justify-between items-start">
						<div className="space-y-2">
							<Skeleton className="h-8 w-24" />
							<Skeleton className="h-4 w-36" />
						</div>
						<div className="space-y-2 items-end flex flex-col">
							<Skeleton className="h-5 w-44" />
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-40" />
							<Skeleton className="h-4 w-36" />
						</div>
					</div>
					{/* 발행 정보 */}
					<div className="flex gap-8 border-t pt-6">
						<div className="space-y-2">
							<Skeleton className="h-3 w-12" />
							<Skeleton className="h-5 w-24" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-3 w-16" />
							<Skeleton className="h-5 w-24" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-3 w-8" />
							<Skeleton className="h-6 w-14 rounded-full" />
						</div>
					</div>
					{/* 거래처 정보 */}
					<div className="border-t pt-6 space-y-2">
						<Skeleton className="h-3 w-16" />
						<Skeleton className="h-6 w-48" />
					</div>
					{/* 항목 테이블 */}
					<div className="border-t pt-6 space-y-3">
						<div className="flex gap-4">
							<Skeleton className="h-4 flex-1" />
							<Skeleton className="h-4 w-12" />
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-24" />
						</div>
						{[1, 2, 3].map((i) => (
							<div key={i} className="flex gap-4 border-t border-border/50 pt-3">
								<Skeleton className="h-4 flex-1" />
								<Skeleton className="h-4 w-12" />
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-24" />
							</div>
						))}
					</div>
					{/* 합계 */}
					<div className="flex justify-end">
						<div className="w-64 space-y-2">
							<div className="flex justify-between">
								<Skeleton className="h-4 w-16" />
								<Skeleton className="h-4 w-20" />
							</div>
							<div className="flex justify-between">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-20" />
							</div>
							<div className="flex justify-between border-t pt-2">
								<Skeleton className="h-5 w-10" />
								<Skeleton className="h-5 w-24" />
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (isError) {
		return (
			<div className="max-w-4xl mx-auto py-8 px-4 md:px-8">
				<Alert variant="destructive">
					<AlertDescription className="flex items-center justify-between">
						<span>{error?.message}</span>
						<Button variant="outline" size="sm" onClick={() => refetch()}>
							<RefreshCw className="size-4 mr-2" />
							재시도
						</Button>
					</AlertDescription>
				</Alert>
			</div>
		)
	}

	const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0)
	const tax = Math.round(subtotal * 0.1)
	const total = subtotal + tax

	const bannerConfig = STATUS_BANNER_CONFIG[invoice.status]
	const BannerIcon = bannerConfig.icon

	return (
		<div className="max-w-4xl mx-auto py-8 px-4 md:px-8">
			{/* 상단 액션 영역 - 인쇄 시 숨김 */}
			<div className="flex items-center justify-between mb-6 print:hidden">
				<InvoiceStatusBadge status={invoice.status} />
				<Button
					variant="outline"
					disabled={isDownloading}
					onClick={() => handlePdfDownload(id, invoice.invoiceNumber, setIsDownloading)}
				>
					{isDownloading ? (
						<Loader2 className="size-4 mr-2 animate-spin" />
					) : (
						<Download className="size-4 mr-2" />
					)}
					PDF 다운로드
				</Button>
				<Button
					variant="outline"
					onClick={() => window.print()}
				>
					<Printer className="size-4 mr-2" />
					인쇄
				</Button>
			</div>

			{/* 상태별 배너 - 인쇄 시 숨김 */}
			<div
				className={cn(
					"flex items-center gap-3 px-4 py-3 rounded-lg border mb-6 text-sm font-medium print:hidden",
					bannerConfig.className
				)}
			>
				<BannerIcon className={cn("size-4 shrink-0", bannerConfig.iconClassName)} />
				<span>{bannerConfig.message}</span>
			</div>

			{/* 견적서 본문 - 테마 대응 + 인쇄 친화적 */}
			<div className="bg-card text-card-foreground rounded-lg shadow-sm border p-10 space-y-8 print:shadow-none print:border-none print:p-0">

				{/* 헤더 */}
				<div className="flex justify-between items-start gap-8">
					{/* 좌측: 제목 + 번호 */}
					<div>
						<h1 className="text-4xl font-extrabold tracking-tight text-foreground">견적서</h1>
						<p className="text-muted-foreground mt-1.5 text-sm font-mono">{invoice.invoiceNumber}</p>
					</div>

					{/* 우측: 발행인 정보 */}
					<div className="text-right space-y-0.5">
						<p className="font-bold text-foreground text-base">{ISSUER_INFO.businessName}</p>
						<p className="text-sm text-muted-foreground">사업자번호: {ISSUER_INFO.businessNumber}</p>
						<p className="text-sm text-muted-foreground">{ISSUER_INFO.address}</p>
						<p className="text-sm text-muted-foreground">{ISSUER_INFO.name}</p>
						<p className="text-sm text-muted-foreground">{ISSUER_INFO.email}</p>
						<p className="text-sm text-muted-foreground">{ISSUER_INFO.phone}</p>
					</div>
				</div>

				{/* 구분선 */}
				<div className="border-t border-border" />

				{/* 발행 정보 + 거래처 정보 - 2단 그리드 */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
					{/* 좌측: 거래처 정보 */}
					<div className="space-y-1">
						<p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">청구 대상</p>
						<p className="font-bold text-xl text-foreground">{invoice.clientName}</p>
					</div>

					{/* 우측: 날짜 + 상태 */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">발행일</span>
							<span className="text-sm font-medium text-foreground">{formatDate(invoice.issueDate)}</span>
						</div>
						{invoice.validUntil && (
							<div className="flex items-center justify-between">
								<span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">유효기간</span>
								<span className="text-sm font-medium text-foreground">{formatDate(invoice.validUntil)}</span>
							</div>
						)}
						<div className="flex items-center justify-between">
							<span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">상태</span>
							<InvoiceStatusBadge status={invoice.status} />
						</div>
					</div>
				</div>

				{/* 항목 테이블 */}
				<div className="border-t border-border pt-6 overflow-x-auto">
					<table className="w-full text-sm min-w-[500px]">
						<thead>
							<tr className="border-b-2 border-border">
								<th className="text-left py-3 font-semibold text-muted-foreground text-xs uppercase tracking-widest">항목명</th>
								<th className="text-right py-3 font-semibold text-muted-foreground text-xs uppercase tracking-widest w-16">수량</th>
								<th className="text-right py-3 font-semibold text-muted-foreground text-xs uppercase tracking-widest w-32">단가</th>
								<th className="text-right py-3 font-semibold text-muted-foreground text-xs uppercase tracking-widest w-32">금액</th>
							</tr>
						</thead>
						<tbody>
							{invoice.items.map((item, index) => (
								<tr
									key={item.id}
									className={cn(
										"border-b border-border/50 transition-colors hover:bg-muted/30 print:bg-transparent",
										index % 2 === 1 && "bg-muted/50"
									)}
								>
									<td className="py-3.5 text-foreground">{item.name}</td>
									<td className="py-3.5 text-right text-muted-foreground">{item.quantity}</td>
									<td className="py-3.5 text-right text-muted-foreground">{formatKRW(item.unitPrice)}</td>
									<td className="py-3.5 text-right font-semibold text-foreground">{formatKRW(item.amount)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* 합계 영역 */}
				<div className="flex justify-end print:break-inside-avoid">
					<div className="w-full sm:w-72 space-y-2 text-sm">
						<div className="flex justify-between items-center py-1.5">
							<span className="text-muted-foreground">소계</span>
							<span className="text-foreground">{formatKRW(subtotal)}</span>
						</div>
						<div className="flex justify-between items-center py-1.5 border-b border-border">
							<span className="text-muted-foreground">부가세 (10%)</span>
							<span className="text-foreground">{formatKRW(tax)}</span>
						</div>
						<div className="flex justify-between items-center py-2.5 bg-primary text-primary-foreground rounded-lg px-3 mt-1">
							<span className="font-bold text-sm">최종 합계</span>
							<span className="font-bold text-base">{formatKRW(total)}</span>
						</div>
					</div>
				</div>

				{/* 결제 정보 */}
				<div className="border-t border-border pt-6">
					<div className="bg-muted rounded-lg p-4 space-y-1">
						<p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">계좌 정보</p>
						<p className="text-sm text-foreground font-medium">{ISSUER_INFO.bankInfo}</p>
					</div>
				</div>
			</div>
		</div>
	)
}
