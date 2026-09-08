import { z } from "zod";

/**
 * 記事公開の入力検証スキーマ (publishNoteSchema)
 *
 * 境界防御ルール:
 * - noteId: 必須文字列（トリム後 1 文字以上）
 * - authorId: 必須文字列（トリム後 1 文字以上）
 */
export const publishNoteSchema = z.object({
	noteId: z
		.string({ required_error: "記事IDは必須です" })
		.trim()
		.min(1, "記事IDは必須です"),
	authorId: z
		.string({ required_error: "著者IDは必須です" })
		.trim()
		.min(1, "著者IDは必須です"),
});

/**
 * 記事公開スキーマから自動導出した入力型（Input DTO）
 */
export type PublishNoteSchemaInput = z.infer<typeof publishNoteSchema>;
