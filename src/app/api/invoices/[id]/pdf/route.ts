// GET /api/invoices/[id]/pdf - PDF 생성 및 다운로드
// Phase 2에서 puppeteer-core + @sparticuz/chromium으로 구현 예정
export async function GET() {
	return new Response("PDF 생성 기능은 준비 중입니다.", {
		status: 501,
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	})
}
