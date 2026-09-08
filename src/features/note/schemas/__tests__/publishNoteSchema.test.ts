import { describe, expect, it } from "vitest";
import { validateSchema } from "@/shared/schemas/validateSchema";
import { publishNoteSchema } from "../publishNoteSchema";

describe("publishNoteSchema (記事公開入力スキーマ)", () => {
	it("正しい noteId と authorId が渡された場合、正常に検証を通過すること", () => {
		const rawInput = {
			noteId: "note_12345678",
			authorId: "user_87654321",
		};

		const result = validateSchema(publishNoteSchema, rawInput);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.value.noteId).toBe("note_12345678");
			expect(result.value.authorId).toBe("user_87654321");
		}
	});

	it("前後の不要な空白が自動的にトリムされること", () => {
		const rawInput = {
			noteId: "  note_12345678  ",
			authorId: "  user_87654321  ",
		};

		const result = validateSchema(publishNoteSchema, rawInput);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.value.noteId).toBe("note_12345678");
			expect(result.value.authorId).toBe("user_87654321");
		}
	});

	it("noteId が空文字または未指定の場合はエラーになること", () => {
		const rawInput = {
			noteId: "",
			authorId: "user_87654321",
		};

		const result = validateSchema(publishNoteSchema, rawInput);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.fieldErrors.some((f) => f.field === "noteId")).toBe(
				true,
			);
		}
	});

	it("authorId が数値などの不正な型の場合はエラーになること", () => {
		const rawInput = {
			noteId: "note_12345678",
			authorId: 12345, // 不正な型
		};

		const result = validateSchema(publishNoteSchema, rawInput);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.fieldErrors.some((f) => f.field === "authorId")).toBe(
				true,
			);
		}
	});
});
