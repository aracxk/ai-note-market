import { describe, expect, it } from "vitest";
import {
	Category,
	InvalidCategoryCombinationError,
	type MajorCategory,
	type MinorCategory,
} from "../Category";

describe("Category (カテゴリ Value Object)", () => {
	describe("正常系", () => {
		it("開発×設定ルール（ENGINEERING × RULES_CONFIG）を正常に生成できること", () => {
			const result = Category.create("ENGINEERING", "RULES_CONFIG");

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.major).toBe("ENGINEERING");
				expect(result.value.minor).toBe("RULES_CONFIG");
			}
		});

		it("開発×スキル拡張（ENGINEERING × SKILLS_EXTENSION）を正常に生成できること", () => {
			const result = Category.create("ENGINEERING", "SKILLS_EXTENSION");

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.major).toBe("ENGINEERING");
				expect(result.value.minor).toBe("SKILLS_EXTENSION");
			}
		});

		it("マーケティング×プロンプト（MARKETING × PROMPT）を正常に生成できること", () => {
			const result = Category.create("MARKETING", "PROMPT");

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.major).toBe("MARKETING");
				expect(result.value.minor).toBe("PROMPT");
			}
		});

		it("デザイン×プロンプト（DESIGN × PROMPT）を正常に生成できること", () => {
			const result = Category.create("DESIGN", "PROMPT");

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.major).toBe("DESIGN");
				expect(result.value.minor).toBe("PROMPT");
			}
		});

		it("ビジネス×ワークフロー（BUSINESS × WORKFLOW_GUIDE）を正常に生成できること", () => {
			const result = Category.create("BUSINESS", "WORKFLOW_GUIDE");

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.major).toBe("BUSINESS");
				expect(result.value.minor).toBe("WORKFLOW_GUIDE");
			}
		});

		it("Flyweight パターンにより何度生成しても同一インスタンス（参照一致）を返すこと", () => {
			const result1 = Category.create("ENGINEERING", "SKILLS_EXTENSION");
			const result2 = Category.create("ENGINEERING", "SKILLS_EXTENSION");

			expect(result1.success && result2.success).toBe(true);
			if (result1.success && result2.success) {
				// toBe はメモリ番地の一致を検証
				expect(result1.value).toBe(result2.value);
			}
		});

		it("同じ組み合わせの Category 同士は equals() で true を返すこと", () => {
			const catA = Category.create("ENGINEERING", "SOURCE_CODE");
			const catB = Category.create("ENGINEERING", "SOURCE_CODE");

			expect(catA.success && catB.success).toBe(true);
			if (catA.success && catB.success) {
				expect(catA.value.equals(catB.value)).toBe(true);
			}
		});

		it("異なる組み合わせの Category 同士は equals() で false を返すこと", () => {
			const catA = Category.create("ENGINEERING", "PROMPT");
			const catB = Category.create("MARKETING", "PROMPT");

			expect(catA.success && catB.success).toBe(true);
			if (catA.success && catB.success) {
				expect(catA.value.equals(catB.value)).toBe(false);
			}
		});
	});

	describe("異常系（ビジネスルール違反）", () => {
		it("無効な大カテゴリが渡された場合はエラーになること", () => {
			const result = Category.create(
				"INVALID_MAJOR" as MajorCategory,
				"PROMPT",
			);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(InvalidCategoryCombinationError);
				expect(result.error.code).toBe("INVALID_CATEGORY_COMBINATION");
			}
		});

		it("無効な小カテゴリが渡された場合はエラーになること", () => {
			const result = Category.create(
				"ENGINEERING",
				"INVALID_MINOR" as MinorCategory,
			);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(InvalidCategoryCombinationError);
				expect(result.error.code).toBe("INVALID_CATEGORY_COMBINATION");
			}
		});
	});
});
