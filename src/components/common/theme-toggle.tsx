"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

// next-themes 기반 다크/라이트 모드 토글 버튼
// mounted 패턴: SSR에서 현재 테마를 알 수 없으므로 클라이언트 마운트 후 렌더링
export function ThemeToggle() {
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	// eslint-disable-next-line react-hooks/set-state-in-effect
	useEffect(() => setMounted(true), [])

	// 마운트 전: 레이아웃 shift 방지를 위해 동일 크기의 빈 버튼 렌더링
	if (!mounted) {
		return (
			<Button
				variant="ghost"
				size="icon"
				aria-label="테마 전환"
				disabled
				className="size-9"
			/>
		)
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
			className="size-9"
		>
			{theme === "dark" ? (
				<Sun className="size-4" />
			) : (
				<Moon className="size-4" />
			)}
		</Button>
	)
}
