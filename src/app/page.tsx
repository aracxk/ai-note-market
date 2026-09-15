import { NoteList } from "@/features/note/components/NoteList";

export default async function HomePage() {
	// デモ用の静的データ（※本来は QueryService から取得しますが、現在DB未接続＆インメモリが空のため）
	const dummyNotes = [
		{
			noteId: "demo-note-1",
			authorId: "iorirac",
			title: "AIを活用した次世代フロントエンドアーキテクチャ",
			price: 500,
			category: "tech/frontend",
			publishedAt: new Date(),
		},
		{
			noteId: "demo-note-2",
			authorId: "backend-master",
			title: "DDDとクリーンアーキテクチャの実践的アプローチ",
			price: 1500,
			category: "tech/backend",
			publishedAt: new Date(Date.now() - 86400000),
		},
		{
			noteId: "demo-note-3",
			authorId: "beginner-dev",
			title: "【無料公開】ゼロから始めるNext.js App Router入門",
			price: 0,
			category: "tech/frontend",
			publishedAt: new Date(Date.now() - 86400000 * 2),
		},
		{
			noteId: "demo-note-4",
			authorId: "designer-ai",
			title: "読者を魅了するタイポグラフィとホワイトスペースの魔法",
			price: 980,
			category: "design/uiux",
			publishedAt: new Date(Date.now() - 86400000 * 3),
		},
		{
			noteId: "demo-note-5",
			authorId: "marketer-ai",
			title: "Next.jsで作る完璧なSEO対策とGA4組み込みガイド",
			price: 300,
			category: "marketing/seo",
			publishedAt: new Date(Date.now() - 86400000 * 4),
		},
	];

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-extrabold tracking-tight">新着記事</h1>
				<p className="text-gray-500 mt-2">
					最新のAIやアーキテクチャに関する知見をチェックしましょう。
				</p>
			</div>

			<NoteList notes={dummyNotes} />
		</div>
	);
}
