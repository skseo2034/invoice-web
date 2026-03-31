import { z } from "zod"

// 로그인 폼 스키마
export const loginSchema = z.object({
	email: z.string().email("유효한 이메일 주소를 입력하세요"),
	password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
})

export type LoginInput = z.infer<typeof loginSchema>

// 회원가입 폼 스키마 (확장 예시)
export const registerSchema = z
	.object({
		name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
		email: z.string().email("유효한 이메일 주소를 입력하세요"),
		password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "비밀번호가 일치하지 않습니다",
		path: ["confirmPassword"],
	})

export type RegisterInput = z.infer<typeof registerSchema>

// 관리자 로그인 스키마 (환경변수 기반 패스워드 인증)
export const adminLoginSchema = z.object({
	password: z.string().min(1, "비밀번호를 입력하세요"),
})

export type AdminLoginInput = z.infer<typeof adminLoginSchema>
