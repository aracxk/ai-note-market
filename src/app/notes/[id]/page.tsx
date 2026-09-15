import { notFound } from "next/navigation";
import { NoteDetail } from "@/features/note/components/NoteDetail";

// 実際にはリポジトリやQueryServiceを呼び出します
async function getNoteData(id: string) {
	if (id === "not-found") return null;
	return {
		id,
		title: "AIを活用した次世代フロントエンドアーキテクチャ",
		authorId: "iorirac",
		categoryId: "tech",
		price: 500,
		publishedAt: new Date().toISOString(),
	};
}

// Next.js Metadata API: SEO向けの動的メタデータ生成
export async function generateMetadata({ params }: { params: { id: string } }) {
	const note = await getNoteData(params.id);
	if (!note) return { title: "Not Found" };

	return {
		title: `${note.title} | AI-Note Market`,
		description: `作者: ${note.authorId} によるカテゴリ ${note.categoryId} の記事です。`,
		openGraph: {
			title: note.title,
			description: `作者: ${note.authorId} の最新記事`,
			type: "article",
			authors: [note.authorId],
			publishedTime: note.publishedAt,
		},
		twitter: {
			card: "summary_large_image",
			title: note.title,
		},
	};
}

export default async function NotePage({ params }: { params: { id: string } }) {
	const note = await getNoteData(params.id);
	if (!note) {
		notFound();
	}

	// ユーザーが購入済みかどうかの確認をシミュレート
	// デモのためfalseを渡しています。実際には購入後にtrueへ切り替わります。
	const isPurchased = false;

	// Google検索向け JSON-LD (構造化データ: Article)
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: note.title,
		author: {
			"@type": "Person",
			name: note.authorId,
		},
		datePublished: note.publishedAt,
		isAccessibleForFree: isPurchased,
		offers: {
			"@type": "Offer",
			price: note.price,
			priceCurrency: "JPY",
		},
	};

	return (
		<>
			{/* JSON-LD の注入 */}
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires dangerouslySetInnerHTML
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<NoteDetail note={note} isPurchased={isPurchased} />
		</>
	);
}
