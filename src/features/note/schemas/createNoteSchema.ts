import { z } from "zod";
import {
  MAJOR_CATEGORIES,
  MINOR_CATEGORIES,
} from "../domain/Category";

/**
 * 記事下書き作成の入力検証スキーマ (createDraftNoteSchema)
 *
 * 境界防御ルール:
 * - authorId: 必須文字列
 * - title: 5文字以上 100文字以内
 * - freeArea: 無料エリア本文。10文字以上 10,000文字以内
 * - paidArea: 有料エリア本文。有料記事の場合は必須（1〜50,000文字）
 * - price: 0円（無料）または 100円〜100,000円の整数
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
      .min(5, "タイトルは5文字以上で入力してください")
      .max(100, "タイトルは100文字以内で入力してください"),
    freeArea: z
      .string({ required_error: "無料エリア本文は必須です" })
      .trim()
      .min(10, "無料エリア本文は10文字以上で入力してください")
      .max(10000, "無料エリア本文は10,000文字以内で入力してください"),
    paidArea: z.string().trim().optional(),
    price: z
      .number({ required_error: "価格は必須です" })
      .int("価格は整数で指定してください")
      .refine(
        (val) => val === 0 || (val >= 100 && val <= 100000),
        "価格は0円（無料）、または100円〜100,000円の範囲で指定してください"
      ),
    majorCategory: z.enum(MAJOR_CATEGORIES, {
      errorMap: () => ({ message: "無効な大カテゴリです" }),
    }),
    minorCategory: z.enum(MINOR_CATEGORIES, {
      errorMap: () => ({ message: "無効な小カテゴリです" }),
    }),
  })
  .superRefine((data, ctx) => {
    const isPaid = data.price > 0;
    const paidAreaLength = data.paidArea?.length ?? 0;

    if (isPaid && paidAreaLength === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paidArea"],
        message: "有料記事には有料エリア本文の入力が必須です",
      });
    }

    if (paidAreaLength > 50000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paidArea"],
        message: "有料エリア本文は50,000文字以内で入力してください",
      });
    }
  });

/**
 * 記事作成スキーマから自動導出した入力型（Input DTO）
 */
export type CreateDraftNoteSchemaInput = z.infer<typeof createDraftNoteSchema>;
