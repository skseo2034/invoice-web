import type { Invoice, IssuerInfo } from "@/types"
import { formatKRW, formatDate } from "@/lib/format"

// 상태별 배지 색상
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
	초안: { bg: "#f1f5f9", text: "#475569" },
	대기: { bg: "#fffbeb", text: "#92400e" },
	발송: { bg: "#eff6ff", text: "#1e40af" },
	승인: { bg: "#f0fdf4", text: "#166534" },
	거절: { bg: "#fef2f2", text: "#991b1b" },
}

// 견적서 PDF용 HTML 문서 생성
export function generateInvoiceHTML(invoice: Invoice, issuer: IssuerInfo): string {
	const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0)
	const tax = Math.round(subtotal * 0.1)
	const total = subtotal + tax
	const statusColor = STATUS_COLORS[invoice.status] ?? STATUS_COLORS["대기"]

	const itemRows = invoice.items
		.map(
			(item, index) => `
		<tr style="border-bottom: 1px solid #e5e7eb;${index % 2 === 1 ? " background: #f9fafb;" : ""}">
			<td style="padding: 12px 0; color: #1a1a1a;">${item.name}</td>
			<td style="padding: 12px 0; text-align: right; color: #6b7280;">${item.quantity}</td>
			<td style="padding: 12px 0; text-align: right; color: #6b7280;">${formatKRW(item.unitPrice)}</td>
			<td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${formatKRW(item.amount)}</td>
		</tr>`
		)
		.join("")

	const validUntilRow = invoice.validUntil
		? `
		<div style="display: flex; justify-content: space-between; align-items: center;">
			<span style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">유효기간</span>
			<span style="font-size: 14px; font-weight: 500; color: #374151;">${formatDate(invoice.validUntil)}</span>
		</div>`
		: ""

	return `<!DOCTYPE html>
<html lang="ko">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		@page {
			size: A4;
			margin: 0;
		}
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		body {
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif;
			color: #1a1a1a;
			font-size: 14px;
			line-height: 1.6;
			padding: 40px;
		}
		table {
			width: 100%;
			border-collapse: collapse;
			font-size: 14px;
		}
		table thead tr {
			border-bottom: 2px solid #d1d5db;
		}
		table th {
			padding: 12px 0;
			font-size: 11px;
			font-weight: 600;
			color: #9ca3af;
			text-transform: uppercase;
			letter-spacing: 0.1em;
		}
		table tbody tr {
			break-inside: avoid;
		}
	</style>
</head>
<body>
	<!-- 헤더 -->
	<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 32px;">
		<div>
			<h1 style="font-size: 32px; font-weight: 800; letter-spacing: -0.025em; color: #1a1a1a; margin-bottom: 6px;">견적서</h1>
			<p style="color: #9ca3af; font-size: 14px; font-family: monospace;">${invoice.invoiceNumber}</p>
		</div>
		<div style="text-align: right; line-height: 1.8;">
			<p style="font-weight: 700; color: #1a1a1a; font-size: 16px;">${issuer.businessName}</p>
			<p style="font-size: 13px; color: #6b7280;">사업자번호: ${issuer.businessNumber}</p>
			<p style="font-size: 13px; color: #6b7280;">${issuer.address}</p>
			<p style="font-size: 13px; color: #6b7280;">${issuer.name}</p>
			<p style="font-size: 13px; color: #6b7280;">${issuer.email}</p>
			<p style="font-size: 13px; color: #6b7280;">${issuer.phone}</p>
		</div>
	</div>

	<!-- 구분선 -->
	<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

	<!-- 청구 대상 + 발행 정보 -->
	<div style="display: flex; gap: 32px; margin-bottom: 32px;">
		<div style="flex: 1;">
			<p style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 4px;">청구 대상</p>
			<p style="font-size: 20px; font-weight: 700; color: #1a1a1a;">${invoice.clientName}</p>
		</div>
		<div style="flex: 1; display: flex; flex-direction: column; gap: 12px;">
			<div style="display: flex; justify-content: space-between; align-items: center;">
				<span style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">발행일</span>
				<span style="font-size: 14px; font-weight: 500; color: #374151;">${formatDate(invoice.issueDate)}</span>
			</div>
			${validUntilRow}
			<div style="display: flex; justify-content: space-between; align-items: center;">
				<span style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">상태</span>
				<span style="display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: ${statusColor.bg}; color: ${statusColor.text};">${invoice.status}</span>
			</div>
		</div>
	</div>

	<!-- 항목 테이블 -->
	<div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
		<table>
			<thead>
				<tr>
					<th style="text-align: left;">항목명</th>
					<th style="text-align: right; width: 60px;">수량</th>
					<th style="text-align: right; width: 120px;">단가</th>
					<th style="text-align: right; width: 120px;">금액</th>
				</tr>
			</thead>
			<tbody>
				${itemRows}
			</tbody>
		</table>
	</div>

	<!-- 합계 영역 -->
	<div style="display: flex; justify-content: flex-end; margin-top: 24px;">
		<div style="width: 280px; font-size: 14px;">
			<div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0;">
				<span style="color: #6b7280;">소계</span>
				<span style="color: #374151;">${formatKRW(subtotal)}</span>
			</div>
			<div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
				<span style="color: #6b7280;">부가세 (10%)</span>
				<span style="color: #374151;">${formatKRW(tax)}</span>
			</div>
			<div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #1a1a1a; color: #ffffff; border-radius: 8px; margin-top: 8px;">
				<span style="font-weight: 700; font-size: 14px;">최종 합계</span>
				<span style="font-weight: 700; font-size: 16px;">${formatKRW(total)}</span>
			</div>
		</div>
	</div>

	<!-- 계좌 정보 -->
	<div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
		<div style="background: #f5f5f5; border-radius: 8px; padding: 16px;">
			<p style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 8px;">계좌 정보</p>
			<p style="font-size: 14px; font-weight: 500; color: #374151;">${issuer.bankInfo}</p>
		</div>
	</div>
</body>
</html>`
}
