import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { QueryProvider } from "@/components/common/query-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SITE_CONFIG } from "@/constants"
import "./globals.css"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

// 사이트 메타데이터 - constants에서 가져와 일관성 유지
export const metadata: Metadata = {
	title: {
		default: SITE_CONFIG.name,
		template: `%s | ${SITE_CONFIG.name}`,
	},
	description: SITE_CONFIG.description,
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		// suppressHydrationWarning: next-themes의 theme 클래스 주입 시 경고 방지
		<html lang="ko" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{/*
				 * ThemeProvider 설정:
				 * - attribute="class": globals.css의 .dark 클래스 패턴과 호환
				 * - defaultTheme="system": OS 테마 설정 자동 반영
				 * - enableSystem: 시스템 테마 감지 활성화
				 * - disableTransitionOnChange: 테마 전환 시 깜빡임 방지
				 */}
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{/* TanStack Query Provider - 서버 상태 관리 */}
					<QueryProvider>
						{/* Tooltip 전역 Provider */}
						<TooltipProvider>
							{children}
						</TooltipProvider>
					</QueryProvider>
					{/* Sonner 토스트 컨테이너 */}
					<Toaster richColors position="bottom-right" />
				</ThemeProvider>
			</body>
		</html>
	)
}
