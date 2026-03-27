import { Client } from "@notionhq/client"

// 노션 클라이언트 싱글턴
export const notion = new Client({
	auth: process.env.NOTION_API_KEY,
})

// 견적서 데이터베이스 ID
export const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!
