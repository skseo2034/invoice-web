import { Separator } from "@/components/ui/separator"

interface PageHeaderProps {
	title: string
	description?: string
	// 우측에 배치할 액션 버튼 등
	actions?: React.ReactNode
}

// 대시보드 및 내부 페이지 상단에 공통으로 사용하는 헤더 컴포넌트
export function PageHeader({ title, description, actions }: PageHeaderProps) {
	return (
		<div>
			<div className="flex items-center justify-between px-6 py-4">
				<div>
					<h1 className="text-xl font-semibold">{title}</h1>
					{description && (
						<p className="text-sm text-muted-foreground">{description}</p>
					)}
				</div>
				{actions && <div className="flex items-center gap-2">{actions}</div>}
			</div>
			<Separator />
		</div>
	)
}
