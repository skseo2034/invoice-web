import { z } from "zod"

// 견적서 항목 스키마
export const invoiceItemSchema = z.object({
	name: z.string().min(1, "항목명을 입력하세요"),
	quantity: z.number().min(1, "수량은 1 이상이어야 합니다"),
	unitPrice: z.number().min(0, "단가는 0 이상이어야 합니다"),
	amount: z.number().min(0, "금액은 0 이상이어야 합니다"),
})

// 견적서 전체 스키마
export const invoiceSchema = z.object({
	id: z.string(),
	invoiceNumber: z.string().min(1, "견적서 번호를 입력하세요"),
	clientName: z.string().min(1, "거래처명을 입력하세요"),
	status: z.enum(["초안", "대기", "발송", "승인", "거절"]),
	issueDate: z.string().min(1, "발행일을 입력하세요"),
	validUntil: z.string().optional(),
	items: z.array(invoiceItemSchema),
	totalAmount: z.number().min(0),
})

export type InvoiceInput = z.infer<typeof invoiceSchema>
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>
