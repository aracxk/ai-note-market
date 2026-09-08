import { describe, expect, it } from "vitest";
import { Entity } from "../Entity";
import { ValueObject } from "../ValueObject";

// テスト用ダミーID
class TestId extends ValueObject {
	constructor(public readonly value: string) {
		super();
	}
	public equals(other: TestId): boolean {
		return this.value === other.value;
	}
}

// テスト用ダミーエンティティ
class TestEntity extends Entity<TestId> {
	constructor(
		id: TestId,
		public name: string,
	) {
		super(id);
	}
}

describe("Entity (エンティティ基底クラス)", () => {
	it("id ゲッターでIDを取得できること", () => {
		const id = new TestId("id-123");
		const entity = new TestEntity(id, "テストエンティティ");

		expect(entity.id.equals(id)).toBe(true);
	});

	it("同一IDのエンティティ同士は属性が異なっていても equals() で true を返すこと", () => {
		const id = new TestId("id-123");
		const entityA = new TestEntity(id, "名前A");
		const entityB = new TestEntity(id, "名前B（変更後）");

		expect(entityA.equals(entityB)).toBe(true);
	});

	it("異なるIDのエンティティ同士は equals() で false を返すこと", () => {
		const entityA = new TestEntity(new TestId("id-1"), "名前");
		const entityB = new TestEntity(new TestId("id-2"), "名前");

		expect(entityA.equals(entityB)).toBe(false);
	});

	it("null または undefined との比較時は false を返すこと", () => {
		const entity = new TestEntity(new TestId("id-1"), "名前");

		expect(entity.equals(undefined)).toBe(false);
	});
});
