// Auth 레이아웃: 로그인/회원가입 페이지용 중앙 정렬 단순 레이아웃
// Route Group (auth) - URL에 영향 없음
export default function AuthLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			{children}
		</div>
	)
}
