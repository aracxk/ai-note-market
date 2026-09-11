"use server";

import { revalidatePath } from "next/cache";
// 実際の実装ではリポジトリを注入するかファクトリを使用します。
// ここではデモ用にシミュレートしています。
// ダミーの購入処理サーバーアクションを実装します。
export async function purchaseNoteAction(noteId: string) {
	console.log(`[Server Action] Purchasing note: ${noteId}`);

	// ネットワーク遅延をシミュレート
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// 実際の実装イメージ:
	// const useCase = new PurchaseNoteUseCase(repository);
	// const result = await useCase.execute({ noteId, buyerId: "current-user-id" });
	// if (!result.success) throw new Error(result.error);

	// 記事詳細ページを再検証（キャッシュ破棄）し、有料部分を表示させる
	revalidatePath(`/notes/${noteId}`);

	return { success: true };
}
