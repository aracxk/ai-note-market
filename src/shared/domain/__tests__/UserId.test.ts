import { describe, expect, it } from "vitest";
import { InvalidUserIdError, UserId } from "../UserId";

describe("UserId (ユーザー識別子 Value Object)", () => {
	it("generate() で有効な UUID が生成されること", () => {
		const id = UserId.generate();

		expect(id).toBeInstanceOf(UserId);
		expect(id.value.length).toBeGreaterThan(0);
	});

	it("create() で有効な文字列からインスタンスを生成できること", () => {
		const rawId = "user-123-abc";
		const result = UserId.create(rawId);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.value.value).toBe(rawId);
		}
	});

	it("空文字や空白のみを指定した場合はエラーになること", () => {
		const resultEmpty = UserId.create("");
		const resultBlank = UserId.create("   ");

		expect(resultEmpty.success).toBe(false);
		if (!resultEmpty.success) {
			expect(resultEmpty.error).toBeInstanceOf(InvalidUserIdError);
			expect(resultEmpty.error.code).toBe("INVALID_USER_ID");
		}

		expect(resultBlank.success).toBe(false);
		if (!resultBlank.success) {
			expect(resultBlank.error).toBeInstanceOf(InvalidUserIdError);
		}
	});

	it("同じ値の UserId 同士は equals() で true を返すこと", () => {
		const res1 = UserId.create("user-abc");
		const res2 = UserId.create("user-abc");

		expect(res1.success && res2.success).toBe(true);
		if (res1.success && res2.success) {
			expect(res1.value.equals(res2.value)).toBe(true);
		}
	});

	it("異なる値の UserId 同士は equals() で false を返すこと", () => {
		const res1 = UserId.create("user-1");
		const res2 = UserId.create("user-2");

		expect(res1.success && res2.success).toBe(true);
		if (res1.success && res2.success) {
			expect(res1.value.equals(res2.value)).toBe(false);
		}
	});
});
