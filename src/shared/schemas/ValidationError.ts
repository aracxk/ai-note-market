import type { ZodError } from "zod";

/**
 * 入力フィールドごとの検証エラー詳細
 */
export interface FieldErrorDetail {
	field: string;
	message: string;
}

/**
 * 境界防御（Zod スキーマ検証）で発生する入力エラー
 *
 * 責務:
 * - ZodError を受け取り、画面（UI）や API クライアントが解釈しやすい
 *   「フィールド名」と「エラーメッセージ」の配列に整形する。
 */
export class SchemaValidationError extends Error {
	public readonly name = "SchemaValidationError";
	public readonly code = "SCHEMA_VALIDATION_ERROR";
	public readonly fieldErrors: FieldErrorDetail[];

	constructor(zodError: ZodError) {
		const fieldErrors = zodError.errors.map((e) => ({
			field: e.path.join(".") || "root",
			message: e.message,
		}));

		const summary = fieldErrors
			.map((e) => `[${e.field}]: ${e.message}`)
			.join(", ");

		super(`入力データの検証に失敗しました: ${summary}`);
		this.fieldErrors = fieldErrors;
	}
}
