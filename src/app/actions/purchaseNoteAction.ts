"use server";

import { revalidatePath } from "next/cache";
import { registry } from "@/lib/registry";

export type ActionState = {
	success: boolean;
	error?: string;
};

export async function purchaseNoteAction(noteId: string): Promise<ActionState> {
	console.log(`[Server Action] Purchasing note: ${noteId}`);

	try {
		// 現在のログインユーザー（デモ用に固定）
		const currentUserId = "test-buyer";

		// UseCase の実行
		const result = await registry.purchaseUseCase.execute({
			noteId,
			buyerId: currentUserId,
		});

		// ドメイン層の Result を評価し、エラーならメッセージを返す
		if (!result.success) {
			return { success: false, error: result.error.message };
		}

		// 記事詳細ページを再検証（キャッシュ破棄）し、有料部分を表示させる
		revalidatePath(`/notes/${noteId}`);

		return { success: true };
	} catch (error) {
		console.error("サーバーアクションで予期せぬエラー:", error);
		return {
			success: false,
			error: "サーバーで予期せぬエラーが発生しました。",
		};
	}
}
