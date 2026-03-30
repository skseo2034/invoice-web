import { Client } from "@notionhq/client"

// 노션 클라이언트 싱글턴
export const notion = new Client({
	auth: process.env.NOTION_API_KEY,
})

// 견적서 데이터베이스 ID
export const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!

// SDK v5에서 databases.query가 제거되어 REST API로 직접 호출
export async function queryDatabase(databaseId: string, body: Record<string, unknown> = {}) {
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
		}
	)
	if (!response.ok) {
		const error = await response.json()
		throw new Error(error.message ?? "노션 데이터베이스 조회 실패")
	}
	return response.json()
}
