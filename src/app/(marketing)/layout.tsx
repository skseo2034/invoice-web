import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

// Marketing 레이아웃: Header + main + Footer
// Route Group (marketing) - URL에 영향 없음
export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="flex min-h-screen flex-col">
			<Header />
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	)
}
