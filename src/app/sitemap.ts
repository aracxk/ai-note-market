import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	// 本来は QueryService を使って公開済みの記事一覧（IDと更新日時）をDBから取得します
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000";

	// デモ用の静的サイトマップ
	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: `${baseUrl}/notes/demo-note-1`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.8,
		},
	];
}
