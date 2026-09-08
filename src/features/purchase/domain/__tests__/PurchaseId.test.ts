import { describe, it, expect } from "vitest";
import { PurchaseId, InvalidPurchaseIdError } from "../PurchaseId";

describe("PurchaseId (購入識別子 Value Object)", () => {
	it("generate() で有効な UUID が生成されること", () => {
		const id = PurchaseId.generate();

		expect(id).toBeInstanceOf(PurchaseId);
		expect(id.value.length).toBeGreaterThan(0);
	});

	it("create() で有効な文字列からインスタンスを生成できること", () => {
		const rawId = "purchase-123-abc";
		const result = PurchaseId.create(rawId);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.value.value).toBe(rawId);
		}
	});

	it("空文字や空白のみを指定した場合はエラーになること", () => {
		const resultEmpty = PurchaseId.create("");
		const resultBlank = PurchaseId.create("   ");

		expect(resultEmpty.success).toBe(false);
		if (!resultEmpty.success) {
			expect(resultEmpty.error).toBeInstanceOf(InvalidPurchaseIdError);
			expect(resultEmpty.error.code).toBe("INVALID_PURCHASE_ID");
		}

		expect(resultBlank.success).toBe(false);
		if (!resultBlank.success) {
			expect(resultBlank.error).toBeInstanceOf(InvalidPurchaseIdError);
		}
	});

	it("同じ値の PurchaseId 同士は equals() で true を返すこと", () => {
		const res1 = PurchaseId.create("purchase-abc");
		const res2 = PurchaseId.create("purchase-abc");

		expect(res1.success && res2.success).toBe(true);
		if (res1.success && res2.success) {
			expect(res1.value.equals(res2.value)).toBe(true);
		}
	});

	it("異なる値の PurchaseId 同士は equals() で false を返すこと", () => {
		const res1 = PurchaseId.create("purchase-1");
		const res2 = PurchaseId.create("purchase-2");

		expect(res1.success && res2.success).toBe(true);
		if (res1.success && res2.success) {
			expect(res1.value.equals(res2.value)).toBe(false);
		}
	});
});
