import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFound() {
	return (
		<div className="flex min-h-[60vh] items-center justify-center px-4">
			<Card className="w-full max-w-md text-center">
				<CardContent className="pt-10 pb-8 space-y-4">
					<p className="text-6xl font-extrabold text-muted-foreground">404</p>
					<h1 className="text-xl font-semibold">페이지를 찾을 수 없습니다</h1>
					<p className="text-sm text-muted-foreground">
						요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
					</p>
					<Button asChild className="mt-4">
						<Link href="/">홈으로 돌아가기</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
