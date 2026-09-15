import { z } from "zod";

/**
 * フロントエンドのフォーム用バリデーションスキーマ
 * ※ サーバー側で認証情報(buyerId)を付与するため、フォームからは noteId のみ送信する
 */
export const purchaseFormSchema = z.object({
	noteId: z.string().min(1, "記事IDは必須です"),
});

export type PurchaseFormData = z.infer<typeof purchaseFormSchema>;
