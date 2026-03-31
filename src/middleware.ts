import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 관리자 인증 미들웨어
// /dashboard/** 경로 보호, /login 인증된 사용자 리다이렉트
export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl
	const sessionCookie = request.cookies.get("admin_session")
	const isAuthenticated = sessionCookie?.value === process.env.ADMIN_SESSION_SECRET

	// 대시보드 접근 시 인증 확인 → 미인증이면 /login으로
	if (pathname.startsWith("/dashboard") && !isAuthenticated) {
		const loginUrl = new URL("/login", request.url)
		return NextResponse.redirect(loginUrl)
	}

	// 로그인 페이지에서 이미 인증된 사용자 → /dashboard로
	if (pathname === "/login" && isAuthenticated) {
		const dashboardUrl = new URL("/dashboard", request.url)
		return NextResponse.redirect(dashboardUrl)
	}

	return NextResponse.next()
}

// 보호할 경로만 매칭 (공개 경로 제외)
export const config = {
	matcher: ["/dashboard/:path*", "/login"],
}
