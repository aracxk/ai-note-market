import { NoteDetail } from "@/features/note/components/NoteDetail";

// デモ用のダミーデータ取得関数
async function getNoteById(id: string) {
	// 実際にはリポジトリやQueryServiceを呼び出します
	return {
		id,
		title: "テスト記事のタイトル",
		authorId: "user-1",
		categoryId: "tech",
		price: 500,
	};
}

export default async function NotePage({ params }: { params: { id: string } }) {
	const note = await getNoteById(params.id);

	// ユーザーが購入済みかどうかの確認をシミュレート
	// デモのためfalseを渡しています。実際には購入後にtrueへ切り替わります。
	const isPurchased = false;

	return <NoteDetail note={note} isPurchased={isPurchased} />;
}
