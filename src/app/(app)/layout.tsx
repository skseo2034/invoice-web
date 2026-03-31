import { cookies } from "next/headers"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppBreadcrumb } from "@/components/common/app-breadcrumb"

// App 레이아웃: shadcn SidebarProvider + AppSidebar + 콘텐츠 영역
// Route Group (app) - URL에 영향 없음
// cookie 기반으로 사이드바 접힘/펼침 상태를 유지 (shadcn 내장 sidebar_state cookie 활용)
export default async function AppLayout({ children }: { children: React.ReactNode }) {
	const cookieStore = await cookies()
	const sidebarState = cookieStore.get("sidebar_state")?.value
	const defaultOpen = sidebarState !== "false"

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<AppSidebar />
			<SidebarInset>
				{/* 공통 헤더: SidebarTrigger + 구분자 + 브레드크럼 */}
				<header className="flex h-12 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="h-4" />
					<AppBreadcrumb />
				</header>
				{children}
			</SidebarInset>
		</SidebarProvider>
	)
}
