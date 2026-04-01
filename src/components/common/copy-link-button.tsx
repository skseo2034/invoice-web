"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface CopyLinkButtonProps {
	url: string
	variant?: "icon" | "with-input"
	className?: string
}

// 링크 복사 공통 컴포넌트
// - "icon": 아이콘 버튼만 표시 (기본값)
// - "with-input": 읽기전용 Input + 복사 버튼 조합
export function CopyLinkButton({ url, variant = "icon", className }: CopyLinkButtonProps) {
	const [copied, setCopied] = useState(false)

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(url)
			setCopied(true)
			toast.success("링크가 복사되었습니다", { description: url })
			setTimeout(() => setCopied(false), 2000)
		} catch {
			toast.error("복사에 실패했습니다")
		}
	}

	const copyButton = (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					onClick={handleCopy}
					aria-label="링크 복사"
				>
					{copied ? (
						<Check className="size-4 text-green-500" />
					) : (
						<Copy className="size-4" />
					)}
				</Button>
			</TooltipTrigger>
			<TooltipContent>링크 복사</TooltipContent>
		</Tooltip>
	)

	if (variant === "with-input") {
		return (
			<div className={cn("flex items-center gap-2", className)}>
				<Input
					readOnly
					value={url}
					className="text-xs font-mono text-muted-foreground"
				/>
				{copyButton}
			</div>
		)
	}

	return <div className={className}>{copyButton}</div>
}
