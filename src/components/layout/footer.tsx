import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { SITE_CONFIG } from "@/constants"

// 사이트 푸터 (Server Component)
export function Footer() {
	const currentYear = new Date().getFullYear()

	return (
		<footer className="w-full border-t bg-background print:hidden">
			<div className="container mx-auto max-w-screen-xl px-4 py-8">
				<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
					{/* 브랜드 정보 */}
					<div className="flex flex-col items-center gap-1 md:items-start">
						<span className="font-semibold">
							<span className="text-primary">⚡</span> {SITE_CONFIG.name}
						</span>
						<p className="text-xs text-muted-foreground">
							{SITE_CONFIG.description}
						</p>
					</div>

					{/* 링크 그룹 */}
					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<Link
							href="/"
							className="transition-colors hover:text-foreground"
						>
							문서
						</Link>
						<Separator orientation="vertical" className="h-4" />
						<Link
							href="https://github.com"
							target="_blank"
							rel="noopener noreferrer"
							className="transition-colors hover:text-foreground"
						>
							GitHub
						</Link>
						<Separator orientation="vertical" className="h-4" />
						<Link
							href="https://ui.shadcn.com"
							target="_blank"
							rel="noopener noreferrer"
							className="transition-colors hover:text-foreground"
						>
							shadcn/ui
						</Link>
					</div>
				</div>

				<Separator className="my-4" />

				<p className="text-center text-xs text-muted-foreground">
					© {currentYear} {SITE_CONFIG.name}. Next.js + shadcn/ui + Tailwind
					CSS v4로 제작됨.
				</p>
			</div>
		</footer>
	)
}
