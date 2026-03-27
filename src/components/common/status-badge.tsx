import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { INVOICE_STATUS_VARIANT } from "@/constants/invoice"
import type { InvoiceStatus } from "@/types"

interface InvoiceStatusBadgeProps {
	status: InvoiceStatus
	className?: string
}

// 견적서 상태 배지 컴포넌트
export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
	const variant = INVOICE_STATUS_VARIANT[status]
	return (
		<Badge
			variant={variant}
			className={cn(
				status === "승인" && "bg-green-100 text-green-800 hover:bg-green-100",
				className
			)}
		>
			{status}
		</Badge>
	)
}
