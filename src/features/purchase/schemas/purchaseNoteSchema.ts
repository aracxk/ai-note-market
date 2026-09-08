import { z } from "zod";

/**
 * 記事購入の入力検証スキーマ (purchaseNoteSchema)
 *
 * 境界防御ルール:
 * - noteId: 必須文字列（トリム後 1文字以上）
 * - buyerId: 必須文字列（トリム後 1文字以上）
 * - purchasedAt: オプション（Date または ISO 8601 文字列）
 */
export const purchaseNoteSchema = z.object({
	noteId: z
		.string({ required_error: "記事IDは必須です" })
		.trim()
		.min(1, "記事IDは必須です"),
	buyerId: z
		.string({ required_error: "購入者IDは必須です" })
		.trim()
		.min(1, "購入者IDは必須です"),
	purchasedAt: z.coerce.date().optional(),
});

/**
 * 記事購入スキーマから自動導出した入力型（Input DTO）
 */
export type PurchaseNoteSchemaInput = z.infer<typeof purchaseNoteSchema>;
