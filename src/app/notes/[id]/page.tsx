import { notFound } from "next/navigation";
import { NoteDetail } from "@/features/note/components/NoteDetail";
import { registry } from "@/lib/registry";

export async function generateMetadata({ params }: { params: { id: string } }) {
	const currentUserId = "test-buyer";
	const note = await registry.noteDetailQueryService.getNoteDetail(
		params.id,
		currentUserId,
	);
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
	const currentUserId = "test-buyer";

	// 詳細データの取得（購入済みなら有料エリアを含む）
	const note = await registry.noteDetailQueryService.getNoteDetail(
		params.id,
		currentUserId,
	);
	if (!note) {
		notFound();
	}

	// UI表示用フラグ
	const isPurchased = await registry.noteDetailQueryService.isPurchased(
		note.id,
		currentUserId,
	);

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
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires dangerouslySetInnerHTML
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<NoteDetail note={note} isPurchased={isPurchased} />
		</>
	);
}
