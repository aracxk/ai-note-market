import { describe, it, expect } from "vitest";
import { validateSchema } from "@/shared/schemas/validateSchema";
import { createDraftNoteSchema } from "../createNoteSchema";

describe("createDraftNoteSchema (記事下書き作成入力スキーマ)", () => {
	const validBaseInput = {
		authorId: "user_12345",
		title: "TypeScriptによる境界防御の解説",
		freeArea: "これは無料エリアの本文です。10文字以上の長さがあります。",
		price: 0,
		majorCategory: "ENGINEERING",
		minorCategory: "SOURCE_CODE",
	};

	describe("① 正常系", () => {
		it("無料記事（price = 0, paidArea なし）を正常に検証できること", () => {
			const result = validateSchema(createDraftNoteSchema, validBaseInput);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.title).toBe("TypeScriptによる境界防御の解説");
				expect(result.value.price).toBe(0);
			}
		});

		it("有料記事（price = 1000, paidArea あり）を正常に検証できること", () => {
			const paidInput = {
				...validBaseInput,
				price: 1000,
				paidArea: "ここから先が有料エリアの本文です。",
			};

			const result = validateSchema(createDraftNoteSchema, paidInput);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.price).toBe(1000);
				expect(result.value.paidArea).toBe(
					"ここから先が有料エリアの本文です。",
				);
			}
		});
	});

	describe("② 異常系（制約違反の門前払い）", () => {
		it("タイトルが4文字以下の場合は検証エラーになること", () => {
			const invalidInput = {
				...validBaseInput,
				title: "短すぎ",
			};

			const result = validateSchema(createDraftNoteSchema, invalidInput);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.fieldErrors.some((f) => f.field === "title")).toBe(
					true,
				);
			}
		});

		it("無料エリア本文が9文字以下の場合は検証エラーになること", () => {
			const invalidInput = {
				...validBaseInput,
				freeArea: "短い本文",
			};

			const result = validateSchema(createDraftNoteSchema, invalidInput);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(
					result.error.fieldErrors.some((f) => f.field === "freeArea"),
				).toBe(true);
			}
		});

		it("有料記事（price > 0）なのに有料エリア本文がない場合は検証エラーになること", () => {
			const invalidInput = {
				...validBaseInput,
				price: 500,
				paidArea: "", // 空文字
			};

			const result = validateSchema(createDraftNoteSchema, invalidInput);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(
					result.error.fieldErrors.some((f) => f.field === "paidArea"),
				).toBe(true);
			}
		});

		it("価格が不正な範囲（1円〜99円、マイナス、100,001円以上、小数）の場合はエラーになること", () => {
			const testCases = [50, -100, 100001, 100.5];

			for (const invalidPrice of testCases) {
				const invalidInput = {
					...validBaseInput,
					price: invalidPrice,
				};

				const result = validateSchema(createDraftNoteSchema, invalidInput);

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(
						result.error.fieldErrors.some((f) => f.field === "price"),
					).toBe(true);
				}
			}
		});

		it("未定義の大カテゴリ・小カテゴリが渡された場合はエラーになること", () => {
			const invalidInput = {
				...validBaseInput,
				majorCategory: "UNKNOWN_CATEGORY",
				minorCategory: "UNKNOWN_SUBCATEGORY",
			};

			const result = validateSchema(createDraftNoteSchema, invalidInput);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(
					result.error.fieldErrors.some((f) => f.field === "majorCategory"),
				).toBe(true);
				expect(
					result.error.fieldErrors.some((f) => f.field === "minorCategory"),
				).toBe(true);
			}
		});
	});
});
