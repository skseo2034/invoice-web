"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { NAV_ITEMS, SITE_CONFIG } from "@/constants"

// 반응형 헤더
// - 데스크탑(md 이상): 로고 + 네비게이션 링크 + 테마 토글
// - 모바일(md 미만): 로고 + 테마 토글 + 햄버거 → Sheet 슬라이드 메뉴
export function Header() {
	const [mobileOpen, setMobileOpen] = useState(false)

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
			<div className="container mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
				{/* 로고 */}
				<Link href="/" className="flex items-center gap-2 font-semibold">
					<span className="text-primary">⚡</span>
					<span>{SITE_CONFIG.name}</span>
				</Link>

				{/* 데스크탑 네비게이션 */}
				<nav className="hidden items-center gap-6 md:flex">
					{NAV_ITEMS.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							target={item.external ? "_blank" : undefined}
							rel={item.external ? "noopener noreferrer" : undefined}
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							{item.label}
						</Link>
					))}
				</nav>

				{/* 우측 액션 */}
				<div className="flex items-center gap-2">
					<ThemeToggle />

					{/* 모바일 메뉴 트리거 */}
					<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
						<SheetTrigger asChild className="md:hidden">
							<Button
								variant="ghost"
								size="icon"
								aria-label="메뉴 열기"
								className="size-9"
							>
								<Menu className="size-4" />
							</Button>
						</SheetTrigger>
						<SheetContent side="right" className="w-64">
							<SheetHeader>
								<SheetTitle>{SITE_CONFIG.name}</SheetTitle>
							</SheetHeader>
							<Separator className="my-4" />
							<nav className="flex flex-col gap-1">
								{NAV_ITEMS.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										target={item.external ? "_blank" : undefined}
										rel={item.external ? "noopener noreferrer" : undefined}
										onClick={() => setMobileOpen(false)}
										className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
									>
										{item.label}
									</Link>
								))}
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	)
}
