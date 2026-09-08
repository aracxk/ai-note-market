import { z } from "zod";
import { MAJOR_CATEGORIES, MINOR_CATEGORIES } from "../domain/Category";
import { NoteContent } from "../domain/NoteContent";
import { NoteTitle } from "../domain/NoteTitle";
import { Price } from "../domain/Price";

/**
 * 記事下書き作成の入力検証スキーマ (createDraftNoteSchema)
 *
 * 境界防御ルール（ドメイン定数と完全同期）:
 * - authorId: 必須文字列
 * - title: NoteTitle.MIN_LENGTH 〜 NoteTitle.MAX_LENGTH 文字
 * - freeArea: NoteContent.FREE_AREA_MIN_LENGTH 〜 NoteContent.FREE_AREA_MAX_LENGTH 文字
 * - paidArea: 有料記事の場合は必須（1 〜 NoteContent.PAID_AREA_MAX_LENGTH 文字）
 * - price: Price.FREE_AMOUNT または Price.MIN_AMOUNT 〜 Price.MAX_AMOUNT の整数
 * - majorCategory: MAJOR_CATEGORIES のいずれか
 * - minorCategory: MINOR_CATEGORIES のいずれか
 */
export const createDraftNoteSchema = z
	.object({
		authorId: z
			.string({ required_error: "著者IDは必須です" })
			.trim()
			.min(1, "著者IDは必須です"),
		title: z
			.string({ required_error: "タイトルは必須です" })
			.trim()
			.min(
				NoteTitle.MIN_LENGTH,
				`タイトルは${NoteTitle.MIN_LENGTH}文字以上で入力してください`,
			)
			.max(
				NoteTitle.MAX_LENGTH,
				`タイトルは${NoteTitle.MAX_LENGTH}文字以内で入力してください`,
			),
		freeArea: z
			.string({ required_error: "無料エリア本文は必須です" })
			.trim()
			.min(
				NoteContent.FREE_AREA_MIN_LENGTH,
				`無料エリア本文は${NoteContent.FREE_AREA_MIN_LENGTH}文字以上で入力してください`,
			)
			.max(
				NoteContent.FREE_AREA_MAX_LENGTH,
				`無料エリア本文は${NoteContent.FREE_AREA_MAX_LENGTH}文字以内で入力してください`,
			),
		paidArea: z.string().trim().optional(),
		price: z
			.number({ required_error: "価格は必須です" })
			.int("価格は整数で指定してください")
			.refine(
				(val) =>
					val === Price.FREE_AMOUNT ||
					(val >= Price.MIN_AMOUNT && val <= Price.MAX_AMOUNT),
				`価格は${Price.FREE_AMOUNT}円（無料）、または${Price.MIN_AMOUNT}円〜${Price.MAX_AMOUNT}円の範囲で指定してください`,
			),
		majorCategory: z.enum(MAJOR_CATEGORIES, {
			errorMap: () => ({ message: "無効な大カテゴリです" }),
		}),
		minorCategory: z.enum(MINOR_CATEGORIES, {
			errorMap: () => ({ message: "無効な小カテゴリです" }),
		}),
	})
	.superRefine((data, ctx) => {
		const isPaid = data.price > Price.FREE_AMOUNT;
		const paidAreaLength = data.paidArea?.length ?? 0;

		if (isPaid && paidAreaLength === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["paidArea"],
				message: "有料記事には有料エリア本文の入力が必須です",
			});
		}

		if (paidAreaLength > NoteContent.PAID_AREA_MAX_LENGTH) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["paidArea"],
				message: `有料エリア本文は${NoteContent.PAID_AREA_MAX_LENGTH}文字以内で入力してください`,
			});
		}
	});

/**
 * 記事作成スキーマから自動導出した入力型（Input DTO）
 */
export type CreateDraftNoteSchemaInput = z.infer<typeof createDraftNoteSchema>;
