"use client"

import { useQuery } from "@tanstack/react-query"
import { Download, RefreshCw, FileEdit, Clock, Send, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InvoiceStatusBadge } from "@/components/common/status-badge"
import { ISSUER_INFO } from "@/constants/invoice"
import { cn } from "@/lib/utils"
import type { Invoice, InvoiceStatus } from "@/types"
import { getDummyInvoice } from "@/lib/dummy-data"

// 원화 포맷팅
function formatKRW(amount: number): string {
	return new Intl.NumberFormat("ko-KR", {
		style: "currency",
		currency: "KRW",
	}).format(amount)
}

// 날짜 포맷팅
function formatDate(dateStr?: string): string {
	if (!dateStr) return "-"
	return new Date(dateStr).toLocaleDateString("ko-KR")
}

async function fetchInvoice(id: string): Promise<Invoice> {
	const invoice = getDummyInvoice(id)
	if (!invoice) throw new Error("존재하지 않는 견적서입니다")
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
	const { data: invoice, isPending, isError, error, refetch } = useQuery({
		queryKey: ["invoice", id],
		queryFn: () => fetchInvoice(id),
		staleTime: 60_000,
	})

	if (isPending) {
		return (
			<div className="max-w-4xl mx-auto p-8 space-y-6">
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
							<div key={i} className="flex gap-4 border-t border-gray-100 pt-3">
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
			<div className="max-w-4xl mx-auto p-8">
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
		<div className="max-w-4xl mx-auto p-8">
			{/* 상단 액션 영역 */}
			<div className="flex items-center justify-between mb-6">
				<InvoiceStatusBadge status={invoice.status} />
				<Button variant="outline" disabled>
					<Download className="size-4 mr-2" />
					PDF 다운로드 (준비 중)
				</Button>
			</div>

			{/* 상태별 배너 */}
			<div
				className={cn(
					"flex items-center gap-3 px-4 py-3 rounded-lg border mb-6 text-sm font-medium",
					bannerConfig.className
				)}
			>
				<BannerIcon className={cn("size-4 shrink-0", bannerConfig.iconClassName)} />
				<span>{bannerConfig.message}</span>
			</div>

			{/* 견적서 본문 - 인쇄 친화적 흰색 배경 */}
			<div className="bg-white text-gray-900 rounded-lg shadow-sm border p-10 space-y-8 print:shadow-none print:border-none">

				{/* 헤더 */}
				<div className="flex justify-between items-start gap-8">
					{/* 좌측: 제목 + 번호 */}
					<div>
						<h1 className="text-4xl font-extrabold tracking-tight text-gray-900">견적서</h1>
						<p className="text-gray-400 mt-1.5 text-sm font-mono">{invoice.invoiceNumber}</p>
					</div>

					{/* 우측: 발행인 정보 */}
					<div className="text-right space-y-0.5">
						<p className="font-bold text-gray-900 text-base">{ISSUER_INFO.businessName}</p>
						<p className="text-sm text-gray-500">사업자번호: {ISSUER_INFO.businessNumber}</p>
						<p className="text-sm text-gray-500">{ISSUER_INFO.address}</p>
						<p className="text-sm text-gray-500">{ISSUER_INFO.name}</p>
						<p className="text-sm text-gray-500">{ISSUER_INFO.email}</p>
						<p className="text-sm text-gray-500">{ISSUER_INFO.phone}</p>
					</div>
				</div>

				{/* 구분선 */}
				<div className="border-t border-gray-200" />

				{/* 발행 정보 + 거래처 정보 - 2단 그리드 */}
				<div className="grid grid-cols-2 gap-8">
					{/* 좌측: 거래처 정보 */}
					<div className="space-y-1">
						<p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">청구 대상</p>
						<p className="font-bold text-xl text-gray-900">{invoice.clientName}</p>
					</div>

					{/* 우측: 날짜 + 상태 */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">발행일</span>
							<span className="text-sm font-medium text-gray-700">{formatDate(invoice.issueDate)}</span>
						</div>
						{invoice.validUntil && (
							<div className="flex items-center justify-between">
								<span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">유효기간</span>
								<span className="text-sm font-medium text-gray-700">{formatDate(invoice.validUntil)}</span>
							</div>
						)}
						<div className="flex items-center justify-between">
							<span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">상태</span>
							<InvoiceStatusBadge status={invoice.status} />
						</div>
					</div>
				</div>

				{/* 항목 테이블 */}
				<div className="border-t border-gray-200 pt-6">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b-2 border-gray-200">
								<th className="text-left py-3 font-semibold text-gray-500 text-xs uppercase tracking-widest">항목명</th>
								<th className="text-right py-3 font-semibold text-gray-500 text-xs uppercase tracking-widest w-16">수량</th>
								<th className="text-right py-3 font-semibold text-gray-500 text-xs uppercase tracking-widest w-32">단가</th>
								<th className="text-right py-3 font-semibold text-gray-500 text-xs uppercase tracking-widest w-32">금액</th>
							</tr>
						</thead>
						<tbody>
							{invoice.items.map((item, index) => (
								<tr
									key={item.id}
									className={cn(
										"border-b border-gray-100",
										index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
									)}
								>
									<td className="py-3.5 text-gray-800">{item.name}</td>
									<td className="py-3.5 text-right text-gray-600">{item.quantity}</td>
									<td className="py-3.5 text-right text-gray-600">{formatKRW(item.unitPrice)}</td>
									<td className="py-3.5 text-right font-semibold text-gray-900">{formatKRW(item.amount)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* 합계 영역 */}
				<div className="flex justify-end">
					<div className="w-72 space-y-2 text-sm">
						<div className="flex justify-between items-center py-1.5">
							<span className="text-gray-500">소계</span>
							<span className="text-gray-700">{formatKRW(subtotal)}</span>
						</div>
						<div className="flex justify-between items-center py-1.5 border-b border-gray-200">
							<span className="text-gray-500">부가세 (10%)</span>
							<span className="text-gray-700">{formatKRW(tax)}</span>
						</div>
						<div className="flex justify-between items-center py-2.5 bg-gray-900 text-white rounded-md px-3 mt-1">
							<span className="font-bold text-sm">최종 합계</span>
							<span className="font-bold text-base">{formatKRW(total)}</span>
						</div>
					</div>
				</div>

				{/* 결제 정보 */}
				<div className="border-t border-gray-200 pt-6">
					<div className="bg-gray-50 rounded-md p-4 space-y-1">
						<p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">계좌 정보</p>
						<p className="text-sm text-gray-700 font-medium">{ISSUER_INFO.bankInfo}</p>
					</div>
				</div>
			</div>
		</div>
	)
}
