"use client"

import { useState } from "react"
import { Share2, Mail, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface ShareButtonProps {
	url: string
	title: string
	description?: string
	variant?: "icon" | "default"
	className?: string
}

export function ShareButton({ url, title, description, variant = "icon", className }: ShareButtonProps) {
	const [copied, setCopied] = useState(false)

	async function handleNativeShare() {
		try {
			await navigator.share({ title, text: description, url })
		} catch (err) {
			// 사용자가 공유 취소한 경우 무시
			if (err instanceof Error && err.name !== "AbortError") {
				toast.error("공유에 실패했습니다")
			}
		}
	}

	async function handleCopyLink() {
		try {
			await navigator.clipboard.writeText(url)
			setCopied(true)
			toast.success("링크가 복사되었습니다", { description: url })
			setTimeout(() => setCopied(false), 2000)
		} catch {
			toast.error("복사에 실패했습니다")
		}
	}

	function handleEmailShare() {
		const subject = encodeURIComponent(title)
		const body = encodeURIComponent(`${description ? description + "\n\n" : ""}${url}`)
		window.open(`mailto:?subject=${subject}&body=${body}`)
	}

	// Web Share API 지원 여부
	const supportsShare = typeof navigator !== "undefined" && !!navigator.share

	// 네이티브 공유 지원 시 바로 실행
	if (supportsShare) {
		const btn = (
			<Button
				variant={variant === "icon" ? "ghost" : "outline"}
				size={variant === "icon" ? "icon" : "default"}
				onClick={handleNativeShare}
				className={className}
				aria-label="공유"
			>
				<Share2 className="size-4" />
				{variant === "default" && <span>공유</span>}
			</Button>
		)
		if (variant === "icon") {
			return (
				<Tooltip>
					<TooltipTrigger asChild>{btn}</TooltipTrigger>
					<TooltipContent>공유</TooltipContent>
				</Tooltip>
			)
		}
		return btn
	}

	// 폴백: DropdownMenu
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				{variant === "icon" ? (
					<Button variant="ghost" size="icon" className={className} aria-label="공유">
						<Share2 className="size-4" />
					</Button>
				) : (
					<Button variant="outline" className={className} aria-label="공유">
						<Share2 className="size-4" />
						<span>공유</span>
					</Button>
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={handleCopyLink}>
					{copied ? <Check className="size-4 mr-2 text-green-500" /> : <Copy className="size-4 mr-2" />}
					링크 복사
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleEmailShare}>
					<Mail className="size-4 mr-2" />
					이메일로 공유
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
