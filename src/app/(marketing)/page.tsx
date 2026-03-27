import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SITE_CONFIG } from "@/constants"

export default function HomePage() {
	return (
		<main className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
			<h1 className="text-4xl font-bold tracking-tight mb-4">
				{SITE_CONFIG.name}
			</h1>
			<p className="text-lg text-muted-foreground mb-8 max-w-md">
				노션 데이터베이스로 견적서를 관리하고,
				클라이언트와 손쉽게 공유하세요.
			</p>
			<Button asChild size="lg">
				<Link href="/dashboard/invoices">
					대시보드 바로가기
				</Link>
			</Button>
		</main>
	)
}
