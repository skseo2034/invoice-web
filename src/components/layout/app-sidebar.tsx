"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
import { ThemeToggle } from "@/components/common/theme-toggle"
import { SIDEBAR_ITEMS, SITE_CONFIG } from "@/constants"

// shadcn Sidebar 기반 앱 사이드바
// - 모바일에서 Sheet로 자동 전환 (shadcn Sidebar 내장 기능)
// - 현재 경로에 따라 활성 메뉴 강조
export function AppSidebar() {
	const pathname = usePathname()

	return (
		<Sidebar>
			{/* 사이드바 상단: 로고/브랜드 */}
			<SidebarHeader className="border-b px-4 py-3">
				<Link href="/" className="flex items-center gap-2 font-semibold">
					<span className="text-primary">⚡</span>
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
							<AvatarFallback>U</AvatarFallback>
						</Avatar>
						<div className="flex flex-col">
							<span className="text-sm font-medium">사용자</span>
							<span className="text-xs text-muted-foreground">
								user@example.com
							</span>
						</div>
					</div>
					<ThemeToggle />
				</div>
			</SidebarFooter>
		</Sidebar>
	)
}
