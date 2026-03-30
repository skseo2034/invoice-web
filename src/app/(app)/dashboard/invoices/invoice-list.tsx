"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { RefreshCw, ExternalLink, Copy, Download, Loader2, ArrowUp, ArrowDown, ArrowUpDown, Search, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InvoiceStatusBadge } from "@/components/common/status-badge"
import { handlePdfDownload } from "@/lib/download-pdf"
import { formatKRW, formatDate } from "@/lib/format"
import { useDebounce } from "@/hooks/use-debounce"
import type { InvoiceListItem, InvoiceStatus } from "@/types"

// 필터/정렬 타입
type SortBy = "issueDate" | "totalAmount"
type SortOrder = "asc" | "desc"

// 상태 필터 옵션
const STATUS_OPTIONS: { value: string; label: string }[] = [
	{ value: "all", label: "전체" },
	{ value: "초안", label: "초안" },
	{ value: "대기", label: "대기" },
	{ value: "발송", label: "발송" },
	{ value: "승인", label: "승인" },
	{ value: "거절", label: "거절" },
]

// API 페치 함수 (필터/정렬 파라미터 포함)
async function fetchInvoices(
	status: string,
	sortBy: SortBy,
	sortOrder: SortOrder,
): Promise<InvoiceListItem[]> {
	const params = new URLSearchParams()
	if (status !== "all") params.set("status", status)
	params.set("sortBy", sortBy)
	params.set("sortOrder", sortOrder)

	const res = await fetch(`/api/invoices?${params.toString()}`)
	if (!res.ok) {
		const body = await res.json().catch(() => ({}))
		throw new Error(body.error ?? "견적서 목록을 불러오는데 실패했습니다")
	}
	const { invoices } = await res.json()
	return invoices
}

// 링크 복사 핸들러
function handleCopyLink(id: string) {
	const url = `${window.location.origin}/invoices/${id}`
	navigator.clipboard.writeText(url)
	toast.success("링크가 복사되었습니다")
}

// 개별 행의 PDF 다운로드 버튼 (각각 독립 로딩 상태)
function PdfDownloadButton({ invoiceId, invoiceNumber }: { invoiceId: string; invoiceNumber: string }) {
	const [isDownloading, setIsDownloading] = useState(false)
	return (
		<Button
			variant="ghost"
			size="icon"
			disabled={isDownloading}
			onClick={() => handlePdfDownload(invoiceId, invoiceNumber, setIsDownloading)}
			aria-label="PDF 다운로드"
		>
			{isDownloading ? (
				<Loader2 className="size-4 animate-spin" />
			) : (
				<Download className="size-4" />
			)}
		</Button>
	)
}

// 정렬 가능한 테이블 헤더
function SortableHeader({
	label,
	field,
	currentSortBy,
	currentSortOrder,
	onSort,
	className,
}: {
	label: string
	field: SortBy
	currentSortBy: SortBy
	currentSortOrder: SortOrder
	onSort: (field: SortBy) => void
	className?: string
}) {
	const isActive = currentSortBy === field
	return (
		<TableHead className={className}>
			<button
				type="button"
				className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
				onClick={() => onSort(field)}
			>
				{label}
				{isActive ? (
					currentSortOrder === "asc" ? (
						<ArrowUp className="size-3.5" />
					) : (
						<ArrowDown className="size-3.5" />
					)
				) : (
					<ArrowUpDown className="size-3.5 text-muted-foreground/50" />
				)}
			</button>
		</TableHead>
	)
}

export function InvoiceList() {
	const [status, setStatus] = useState("all")
	const [sortBy, setSortBy] = useState<SortBy>("issueDate")
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
	const [searchQuery, setSearchQuery] = useState("")
	const debouncedSearch = useDebounce(searchQuery, 300)

	const {
		data: invoices,
		isPending,
		isError,
		error,
		refetch,
		isFetching,
	} = useQuery({
		queryKey: ["invoices", { status, sortBy, sortOrder }],
		queryFn: () => fetchInvoices(status, sortBy, sortOrder),
		staleTime: 60_000,
	})

	// 클라이언트 사이드 검색 필터링
	const filteredInvoices = useMemo(() => {
		if (!invoices || !debouncedSearch.trim()) return invoices
		const query = debouncedSearch.toLowerCase()
		return invoices.filter(
			(inv) =>
				inv.clientName.toLowerCase().includes(query) ||
				inv.invoiceNumber.toLowerCase().includes(query)
		)
	}, [invoices, debouncedSearch])

	// 정렬 토글 핸들러
	function handleSort(field: SortBy) {
		if (sortBy === field) {
			setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
		} else {
			setSortBy(field)
			setSortOrder("desc")
		}
	}

	// 필터/정렬/검색 컨트롤 바
	const filterBar = (
		<div className="flex flex-wrap items-center gap-2">
			<div className="relative">
				<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
				<Input
					placeholder="검색..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="h-8 w-40 pl-8 pr-8 text-xs"
				/>
				{searchQuery && (
					<button
						type="button"
						onClick={() => setSearchQuery("")}
						className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					>
						<X className="size-3.5" />
					</button>
				)}
			</div>
			<Select value={status} onValueChange={setStatus}>
				<SelectTrigger className="w-28 h-8 text-xs">
					<SelectValue placeholder="상태" />
				</SelectTrigger>
				<SelectContent>
					{STATUS_OPTIONS.map((opt) => (
						<SelectItem key={opt.value} value={opt.value}>
							{opt.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => refetch()}
				disabled={isFetching}
			>
				<RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
			</Button>
		</div>
	)

	if (isPending) {
		return (
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>견적서 목록</CardTitle>
					{filterBar}
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

	// 빈 상태 메시지 결정
	const hasSearch = debouncedSearch.trim().length > 0
	const hasFilter = status !== "all"
	const isEmpty = !filteredInvoices?.length

	if (!invoices?.length) {
		return (
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>견적서 목록</CardTitle>
					{filterBar}
				</CardHeader>
				<CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
					<p className="text-sm">
						{hasFilter ? "해당 상태의 견적서가 없습니다." : "견적서가 없습니다."}
					</p>
					<p className="text-xs mt-1">
						{hasFilter ? "다른 상태를 선택해보세요." : "새 견적서를 추가해주세요."}
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>견적서 목록</CardTitle>
				{filterBar}
			</CardHeader>
			<CardContent className="overflow-x-auto">
				{isEmpty ? (
					<div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
						<Search className="size-8 mb-3 text-muted-foreground/50" />
						<p className="text-sm">검색 결과가 없습니다.</p>
						<p className="text-xs mt-1">다른 검색어를 입력해보세요.</p>
					</div>
				) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>견적번호</TableHead>
							<TableHead>거래처명</TableHead>
							<SortableHeader
								label="금액"
								field="totalAmount"
								currentSortBy={sortBy}
								currentSortOrder={sortOrder}
								onSort={handleSort}
								className="text-right"
							/>
							<TableHead>상태</TableHead>
							<SortableHeader
								label="발행일"
								field="issueDate"
								currentSortBy={sortBy}
								currentSortOrder={sortOrder}
								onSort={handleSort}
							/>
							<TableHead className="text-right">액션</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredInvoices!.map((invoice) => (
							<TableRow key={invoice.id}>
								<TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
								<TableCell>{invoice.clientName}</TableCell>
								<TableCell className="text-right">{formatKRW(invoice.totalAmount)}</TableCell>
								<TableCell>
									<InvoiceStatusBadge status={invoice.status} />
								</TableCell>
								<TableCell>{formatDate(invoice.issueDate)}</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end gap-1">
										<PdfDownloadButton
											invoiceId={invoice.id}
											invoiceNumber={invoice.invoiceNumber}
										/>
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
				)}
			</CardContent>
		</Card>
	)
}
