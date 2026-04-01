import { Client } from "@notionhq/client"

// 노션 클라이언트 싱글턴
export const notion = new Client({
	auth: process.env.NOTION_API_KEY,
})

// 견적서 데이터베이스 ID
export const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!

// --- 메모리 캐시 유틸 ---
const cache = new Map<string, { data: unknown; expiry: number }>()
const DEFAULT_TTL = 60 * 1000 // 기본 TTL: 1분

// 캐시된 데이터 조회 (TTL 만료 시 재요청)
async function getCached<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
	const cached = cache.get(key)
	if (cached && cached.expiry > Date.now()) {
		return cached.data as T
	}
	const data = await fetcher()
	cache.set(key, { data, expiry: Date.now() + ttlMs })
	return data
}

// 캐시 무효화 (특정 키 또는 전체)
export function invalidateCache(key?: string) {
	if (key) {
		cache.delete(key)
	} else {
		cache.clear()
	}
}

// SDK v5에서 databases.query가 제거되어 REST API로 직접 호출
export async function queryDatabase(databaseId: string, body: Record<string, unknown> = {}) {
	// 캐시 키 생성 (DB ID + 요청 본문 기반)
	const cacheKey = `db:${databaseId}:${JSON.stringify(body)}`

	return getCached(cacheKey, DEFAULT_TTL, async () => {
		const response = await fetch(
			`https://api.notion.com/v1/databases/${databaseId}/query`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
					"Notion-Version": "2022-06-28",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
				// Next.js fetch 캐시 (서버 사이드 중복 요청 방지)
				next: { revalidate: 60 },
			} as RequestInit
		)
		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.message ?? "노션 데이터베이스 조회 실패")
		}
		return response.json()
	})
}
