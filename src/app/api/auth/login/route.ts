import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { adminLoginSchema } from "@/lib/validations/auth"

// POST /api/auth/login - 관리자 로그인
export async function POST(request: Request) {
	try {
		const body = await request.json()
		const parsed = adminLoginSchema.safeParse(body)

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "유효하지 않은 요청입니다" },
				{ status: 400 }
			)
		}

		// 환경변수 패스워드와 비교
		if (parsed.data.password !== process.env.ADMIN_PASSWORD) {
			return NextResponse.json(
				{ error: "비밀번호가 올바르지 않습니다" },
				{ status: 401 }
			)
		}

		// 세션 쿠키 설정 (httpOnly, 24시간 유효)
		const cookieStore = await cookies()
		cookieStore.set("admin_session", process.env.ADMIN_SESSION_SECRET!, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24, // 24시간
		})

		return NextResponse.json({ success: true })
	} catch {
		return NextResponse.json(
			{ error: "로그인 처리 중 오류가 발생했습니다" },
			{ status: 500 }
		)
	}
}
