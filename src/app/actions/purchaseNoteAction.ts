"use server";

import { revalidatePath } from "next/cache";

export type ActionState = {
	success: boolean;
	error?: string;
};

// 実際の実装ではリポジトリを注入するかファクトリを使用します。
// ここではデモ用にシミュレートしています。
// ダミーの購入処理サーバーアクションを実装します。
export async function purchaseNoteAction(noteId: string): Promise<ActionState> {
	console.log(`[Server Action] Purchasing note: ${noteId}`);

	try {
		// ネットワーク遅延をシミュレート
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// 実際の実装イメージ:
		// const useCase = new PurchaseNoteUseCase(repository);
		// const result = await useCase.execute({ noteId, buyerId: "current-user-id" });
		// 🚨 悪い例: if (!result.success) throw new Error(result.error);
		// ✅ 良い例: ドメイン層の Result をそのままクライアントへ返す
		// if (!result.success) {
		// 	return { success: false, error: result.error.message };
		// }

		// 記事詳細ページを再検証（キャッシュ破棄）し、有料部分を表示させる
		revalidatePath(`/notes/${noteId}`);

		return { success: true };
	} catch (error) {
		console.error("サーバーアクションで予期せぬエラー:", error);
		// システムエラー時も throw ではなく 500系の安全なレスポンスを返す
		return {
			success: false,
			error: "サーバーで予期せぬエラーが発生しました。",
		};
	}
}
