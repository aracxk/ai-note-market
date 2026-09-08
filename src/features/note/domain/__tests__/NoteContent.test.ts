import { describe, it, expect } from "vitest";
import {
	NoteContent,
	InvalidFreeAreaLengthError,
	PaidAreaRequiredForPaidNoteError,
	InvalidPaidAreaLengthError,
} from "../NoteContent";

describe("NoteContent (記事本文 Value Object)", () => {
	describe("正常系", () => {
		it("無料記事の本文（無料エリア10文字）を正常に生成できること", () => {
			const freeArea = "これは無料エリアの本文です。"; // 14文字
			const result = NoteContent.createFree(freeArea);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.freeArea).toBe(freeArea);
				expect(result.value.paidArea).toBe("");
			}
		});

		it("無料記事の本文（無料エリア上限10,000文字）を正常に生成できること", () => {
			const freeArea = "あ".repeat(10000);
			const result = NoteContent.createFree(freeArea);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.freeArea.length).toBe(10000);
				expect(result.value.paidArea).toBe("");
			}
		});

		it("有料記事の本文（無料10文字 ＋ 有料1文字の下限値）を正常に生成できること", () => {
			const freeArea = "1234567890";
			const paidArea = "A";
			const result = NoteContent.createPaid({ freeArea, paidArea });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.freeArea).toBe(freeArea);
				expect(result.value.paidArea).toBe(paidArea);
			}
		});

		it("有料記事の本文（無料10,000文字 ＋ 有料50,000文字の上限値）を正常に生成できること", () => {
			const freeArea = "あ".repeat(10000);
			const paidArea = "い".repeat(50000);
			const result = NoteContent.createPaid({ freeArea, paidArea });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.freeArea.length).toBe(10000);
				expect(result.value.paidArea.length).toBe(50000);
			}
		});

		it("前後の空白が自動的にトリムされること", () => {
			const freeArea = "  1234567890  ";
			const paidArea = "  有料ノウハウ本文  ";
			const result = NoteContent.createPaid({ freeArea, paidArea });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.freeArea).toBe("1234567890");
				expect(result.value.paidArea).toBe("有料ノウハウ本文");
			}
		});

		it("汎用ファクトリ（NoteContent.create）で無料記事を生成できること", () => {
			const result = NoteContent.create({
				freeArea: "無料エリア本文12345",
				isPaid: false,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.freeArea).toBe("無料エリア本文12345");
				expect(result.value.paidArea).toBe("");
			}
		});

		it("汎用ファクトリ（NoteContent.create）で有料記事を生成できること", () => {
			const result = NoteContent.create({
				freeArea: "無料エリア本文12345",
				paidArea: "有料エリア本文12345",
				isPaid: true,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.freeArea).toBe("無料エリア本文12345");
				expect(result.value.paidArea).toBe("有料エリア本文12345");
			}
		});

		it("同じ本文の NoteContent 同士は equals() で true を返すこと", () => {
			const contentA = NoteContent.createPaid({
				freeArea: "無料エリア本文12345",
				paidArea: "有料エリア本文12345",
			});
			const contentB = NoteContent.createPaid({
				freeArea: "無料エリア本文12345",
				paidArea: "有料エリア本文12345",
			});

			expect(contentA.success && contentB.success).toBe(true);
			if (contentA.success && contentB.success) {
				expect(contentA.value.equals(contentB.value)).toBe(true);
			}
		});

		it("異なる本文の NoteContent 同士は equals() で false を返すこと", () => {
			const contentA = NoteContent.createPaid({
				freeArea: "無料エリア本文12345",
				paidArea: "有料エリア本文AAA",
			});
			const contentB = NoteContent.createPaid({
				freeArea: "無料エリア本文12345",
				paidArea: "有料エリア本文BBB",
			});

			expect(contentA.success && contentB.success).toBe(true);
			if (contentA.success && contentB.success) {
				expect(contentA.value.equals(contentB.value)).toBe(false);
			}
		});
	});

	describe("異常系（ビジネスルール違反）", () => {
		it("無料エリアが9文字以下（下限未満）の場合はエラーになること", () => {
			const result = NoteContent.createFree("123456789"); // 9文字

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(InvalidFreeAreaLengthError);
				expect(result.error.code).toBe("INVALID_FREE_AREA_LENGTH");
			}
		});

		it("無料エリアが10,001文字以上（上限超過）の場合はエラーになること", () => {
			const result = NoteContent.createFree("あ".repeat(10001));

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(InvalidFreeAreaLengthError);
				expect(result.error.code).toBe("INVALID_FREE_AREA_LENGTH");
			}
		});

		it("無料エリアが空白のみの場合はトリムされて0文字となりエラーになること", () => {
			const result = NoteContent.createFree("          ");

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(InvalidFreeAreaLengthError);
				expect(result.error.code).toBe("INVALID_FREE_AREA_LENGTH");
			}
		});

		it("有料記事で有料エリアが空文字の場合はエラーになること", () => {
			const result = NoteContent.createPaid({
				freeArea: "1234567890",
				paidArea: "",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(PaidAreaRequiredForPaidNoteError);
				expect(result.error.code).toBe("PAID_AREA_REQUIRED_FOR_PAID_NOTE");
			}
		});

		it("有料記事で有料エリアが空白のみの場合はエラーになること", () => {
			const result = NoteContent.createPaid({
				freeArea: "1234567890",
				paidArea: "   ",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(PaidAreaRequiredForPaidNoteError);
				expect(result.error.code).toBe("PAID_AREA_REQUIRED_FOR_PAID_NOTE");
			}
		});

		it("有料記事で有料エリアが50,001文字以上（上限超過）の場合はエラーになること", () => {
			const result = NoteContent.createPaid({
				freeArea: "1234567890",
				paidArea: "あ".repeat(50001),
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(InvalidPaidAreaLengthError);
				expect(result.error.code).toBe("INVALID_PAID_AREA_LENGTH");
			}
		});
	});
});
