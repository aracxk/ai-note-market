import { describe, it, expect } from "vitest";
import { Price, InvalidPriceError } from "../Price";

describe("Price (価格 Value Object)", () => {
	describe("正常系", () => {
		it("0円（無料）の価格オブジェクトを正常に生成できること", () => {
			const result = Price.create(0);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.amount).toBe(0);
				expect(result.value.isFree()).toBe(true);
			}
		});

		it("Price.free() で直接無料価格オブジェクトを取得できること", () => {
			const price = Price.free();

			expect(price.amount).toBe(0);
			expect(price.isFree()).toBe(true);
		});

		it("0円の Price は何度生成しても同一インスタンス（キャッシュ・参照一致）を返すこと", () => {
			const result1 = Price.create(0);
			const result2 = Price.create(0);
			const freePrice = Price.free();

			expect(result1.success && result2.success).toBe(true);
			if (result1.success && result2.success) {
				expect(result1.value).toBe(result2.value);
				expect(result1.value).toBe(freePrice);
			}
		});

		it("下限値（100円）の価格オブジェクトを正常に生成できること", () => {
			const result = Price.create(100);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.amount).toBe(100);
				expect(result.value.isFree()).toBe(false);
			}
		});

		it("上限値（100,000円）の価格オブジェクトを正常に生成できること", () => {
			const result = Price.create(100000);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.amount).toBe(100000);
				expect(result.value.isFree()).toBe(false);
			}
		});

		it("同じ金額の Price インスタンス同士は equals() で true を返すこと", () => {
			const priceA = Price.create(1000);
			const priceB = Price.create(1000);

			expect(priceA.success && priceB.success).toBe(true);
			if (priceA.success && priceB.success) {
				expect(priceA.value.equals(priceB.value)).toBe(true);
			}
		});

		it("異なる金額の Price インスタンス同士は equals() で false を返すこと", () => {
			const priceA = Price.create(1000);
			const priceB = Price.create(2000);

			expect(priceA.success && priceB.success).toBe(true);
			if (priceA.success && priceB.success) {
				expect(priceA.value.equals(priceB.value)).toBe(false);
			}
		});
	});

	describe("異常系（ビジネスルール違反）", () => {
		it("負の数（-100円）を指定した場合はエラーになること", () => {
			const result = Price.create(-100);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(InvalidPriceError);
				expect(result.error.code).toBe("INVALID_PRICE_RANGE");
			}
		});

		it("1円〜99円（下限未満）を指定した場合はエラーになること", () => {
			const result = Price.create(50);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(InvalidPriceError);
				expect(result.error.code).toBe("INVALID_PRICE_RANGE");
			}
		});

		it("100,001円以上（上限超過）を指定した場合はエラーになること", () => {
			const result = Price.create(100001);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(InvalidPriceError);
				expect(result.error.code).toBe("INVALID_PRICE_RANGE");
			}
		});

		it("小数（100.5円）を指定した場合はエラーになること", () => {
			const result = Price.create(100.5);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(InvalidPriceError);
				expect(result.error.code).toBe("INVALID_PRICE_RANGE");
			}
		});
	});
});
