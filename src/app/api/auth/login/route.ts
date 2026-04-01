import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { adminLoginSchema } from "@/lib/validations/auth"

// IP별 로그인 실패 추적 (메모리 기반 Rate Limiting)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5 // 최대 실패 횟수
const LOCKOUT_DURATION = 60 * 1000 // 잠금 시간 (1분)

// Rate limit 확인
function checkRateLimit(ip: string): { blocked: boolean; remainingMs?: number } {
	const record = loginAttempts.get(ip)
	if (!record) return { blocked: false }

	// 잠금 시간이 지났으면 기록 초기화
	if (record.count >= MAX_ATTEMPTS) {
		const elapsed = Date.now() - record.lastAttempt
		if (elapsed < LOCKOUT_DURATION) {
			return { blocked: true, remainingMs: LOCKOUT_DURATION - elapsed }
		}
		// 잠금 해제
		loginAttempts.delete(ip)
	}

	return { blocked: false }
}

// 실패 기록
function recordFailure(ip: string) {
	const record = loginAttempts.get(ip)
	if (record) {
		record.count += 1
		record.lastAttempt = Date.now()
	} else {
		loginAttempts.set(ip, { count: 1, lastAttempt: Date.now() })
	}
}

// 성공 시 기록 초기화
function clearAttempts(ip: string) {
	loginAttempts.delete(ip)
}

// POST /api/auth/login - 관리자 로그인
export async function POST(request: Request) {
	try {
		// IP 추출 (프록시 환경 대비 x-forwarded-for 우선)
		const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
			?? request.headers.get("x-real-ip")
			?? "unknown"

		// Rate limit 확인
		const rateCheck = checkRateLimit(ip)
		if (rateCheck.blocked) {
			const remainingSec = Math.ceil((rateCheck.remainingMs ?? 0) / 1000)
			return NextResponse.json(
				{ error: `너무 많은 시도가 있었습니다. ${remainingSec}초 후 다시 시도하세요.` },
				{ status: 429 }
			)
		}

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
			recordFailure(ip)
			return NextResponse.json(
				{ error: "비밀번호가 올바르지 않습니다" },
				{ status: 401 }
			)
		}

		// 로그인 성공 시 실패 기록 초기화
		clearAttempts(ip)

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
