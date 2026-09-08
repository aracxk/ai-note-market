import { describe, expect, it } from "vitest";
import { validateSchema } from "@/shared/schemas/validateSchema";
import { purchaseNoteSchema } from "../purchaseNoteSchema";

describe("purchaseNoteSchema (記事購入入力スキーマ)", () => {
	it("正しい noteId と buyerId が渡された場合、正常に検証を通過すること", () => {
		const rawInput = {
			noteId: "note_12345678",
			buyerId: "user_buyer_999",
		};

		const result = validateSchema(purchaseNoteSchema, rawInput);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.value.noteId).toBe("note_12345678");
			expect(result.value.buyerId).toBe("user_buyer_999");
		}
	});

	it("purchasedAt に ISO 文字列が渡された場合、Date オブジェクトに自動変換（coerce）されること", () => {
		const rawInput = {
			noteId: "note_12345678",
			buyerId: "user_buyer_999",
			purchasedAt: "2026-09-07T12:00:00.000Z",
		};

		const result = validateSchema(purchaseNoteSchema, rawInput);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.value.purchasedAt).toBeInstanceOf(Date);
			expect(result.value.purchasedAt?.toISOString()).toBe(
				"2026-09-07T12:00:00.000Z",
			);
		}
	});

	it("noteId または buyerId が未指定・空文字の場合はエラーになること", () => {
		const invalidInput = {
			noteId: "",
			buyerId: "   ",
		};

		const result = validateSchema(purchaseNoteSchema, invalidInput);

		expect(result.success).toBe(false);
		if (!result.success) {
			const fieldNames = result.error.fieldErrors.map((f) => f.field);
			expect(fieldNames).toContain("noteId");
			expect(fieldNames).toContain("buyerId");
		}
	});

	it("purchasedAt に無効な日付文字列が渡された場合はエラーになること", () => {
		const invalidInput = {
			noteId: "note_12345678",
			buyerId: "user_buyer_999",
			purchasedAt: "invalid-date-string",
		};

		const result = validateSchema(purchaseNoteSchema, invalidInput);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(
				result.error.fieldErrors.some((f) => f.field === "purchasedAt"),
			).toBe(true);
		}
	});
});
