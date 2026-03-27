"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"

// TanStack Query 전역 Provider
// - staleTime: 1분 (기본 데이터 신선도 유지 시간)
// - retry: 1회 (실패 시 1번 재시도)
export function QueryProvider({ children }: { children: React.ReactNode }) {
	// QueryClient를 useState로 관리하여 서버/클라이언트 간 상태 공유 방지
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
						retry: 1,
					},
				},
			}),
	)

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{/* 개발환경에서만 DevTools 렌더링 */}
			{process.env.NODE_ENV === "development" && (
				<ReactQueryDevtools initialIsOpen={false} />
			)}
		</QueryClientProvider>
	)
}
