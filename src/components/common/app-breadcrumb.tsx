"use client"

import { Fragment } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// 경로 세그먼트 → 한국어 레이블 매핑
const SEGMENT_LABELS: Record<string, string> = {
	dashboard: "대시보드",
	invoices: "견적서",
}

// 경로 기반 동적 브레드크럼 컴포넌트
// usePathname()으로 현재 경로를 파악하여 계층 구조를 표시
export function AppBreadcrumb() {
	const pathname = usePathname()

	// 경로를 세그먼트 배열로 분리 (빈 문자열 제거)
	const segments = pathname.split("/").filter(Boolean)

	// 각 세그먼트에 대한 누적 경로와 레이블 생성
	const items = segments.map((segment, index) => {
		const href = "/" + segments.slice(0, index + 1).join("/")
		// 매핑된 레이블이 없으면 원본 세그먼트를 그대로 표시
		const label = SEGMENT_LABELS[segment] ?? segment
		const isLast = index === segments.length - 1

		return { href, label, isLast }
	})

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{items.map((item, index) => (
					<Fragment key={item.href}>
						{/* 두 번째 항목부터 구분자 표시 */}
						{index > 0 && <BreadcrumbSeparator />}
						<BreadcrumbItem>
							{item.isLast ? (
								// 현재 페이지는 링크 없이 텍스트로 표시
								<BreadcrumbPage>{item.label}</BreadcrumbPage>
							) : (
								// 상위 경로는 클릭 가능한 링크로 표시
								<BreadcrumbLink asChild>
									<Link href={item.href}>{item.label}</Link>
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	)
}
