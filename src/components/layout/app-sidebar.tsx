"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FileText, LogOut } from "lucide-react"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { SIDEBAR_ITEMS, SITE_CONFIG } from "@/constants"
import { ISSUER_INFO } from "@/constants/invoice"

// shadcn Sidebar 기반 앱 사이드바
// - 모바일에서 Sheet로 자동 전환 (shadcn Sidebar 내장 기능)
// - 현재 경로에 따라 활성 메뉴 강조
export function AppSidebar() {
	const pathname = usePathname()
	const router = useRouter()

	async function handleLogout() {
		await fetch("/api/auth/logout", { method: "POST" })
		router.push("/login")
	}

	return (
		<Sidebar>
			{/* 사이드바 상단: 로고/브랜드 */}
			<SidebarHeader className="border-b px-4 py-3">
				<Link href="/" className="flex items-center gap-2 font-semibold">
					<FileText className="size-5 text-primary" />
					<span>{SITE_CONFIG.name}</span>
				</Link>
			</SidebarHeader>

			{/* 사이드바 콘텐츠: 네비게이션 */}
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>메뉴</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{SIDEBAR_ITEMS.map((item) => {
								const Icon = item.icon
								// /dashboard는 정확 일치, 하위 경로(/dashboard/users 등)는 startsWith 적용
							const isActive =
								item.href === "/dashboard"
									? pathname === item.href
									: pathname === item.href || pathname.startsWith(item.href + "/")

								return (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton asChild isActive={isActive}>
											<Link href={item.href}>
												{Icon && <Icon />}
												<span>{item.label}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								)
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			{/* 사이드바 하단: 사용자 정보 + 테마 토글 */}
			<SidebarFooter className="border-t p-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Avatar className="size-8">
							{/* ISSUER_INFO.name 첫 글자를 아바타 폴백으로 사용 */}
							<AvatarFallback>{ISSUER_INFO.name[0]}</AvatarFallback>
						</Avatar>
						<div className="flex flex-col">
							<span className="text-sm font-medium">{ISSUER_INFO.name}</span>
							<span className="text-xs text-muted-foreground">
								{ISSUER_INFO.email}
							</span>
						</div>
					</div>
					<div className="flex items-center gap-1">
						<ThemeToggle />
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="size-8"
									onClick={handleLogout}
									aria-label="로그아웃"
								>
									<LogOut className="size-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>로그아웃</TooltipContent>
						</Tooltip>
					</div>
				</div>
			</SidebarFooter>
		</Sidebar>
	)
}
