"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { adminLoginSchema, type AdminLoginInput } from "@/lib/validations/auth"

export function LoginForm() {
	const router = useRouter()
	const [serverError, setServerError] = useState("")

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<AdminLoginInput>({
		resolver: zodResolver(adminLoginSchema),
	})

	async function onSubmit(data: AdminLoginInput) {
		setServerError("")

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			})

			if (response.ok) {
				router.replace("/dashboard")
			} else {
				const body = await response.json().catch(() => ({}))
				setServerError(body.error ?? "로그인에 실패했습니다")
			}
		} catch {
			setServerError("서버에 연결할 수 없습니다")
		}
	}

	return (
		<Card className="w-full max-w-sm">
			<CardHeader className="text-center">
				<div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
					<FileText className="size-5" />
				</div>
				<CardTitle className="text-xl">관리자 로그인</CardTitle>
				<CardDescription>견적서 관리 시스템에 접속합니다</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					{serverError && (
						<Alert variant="destructive">
							<AlertDescription>{serverError}</AlertDescription>
						</Alert>
					)}

					<div className="space-y-2">
						<Label htmlFor="password">비밀번호</Label>
						<Input
							id="password"
							type="password"
							placeholder="관리자 비밀번호를 입력하세요"
							autoFocus
							{...register("password")}
						/>
						{errors.password && (
							<p className="text-sm text-destructive">
								{errors.password.message}
							</p>
						)}
					</div>

					<Button
						type="submit"
						className="w-full"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								로그인 중...
							</>
						) : (
							"로그인"
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
