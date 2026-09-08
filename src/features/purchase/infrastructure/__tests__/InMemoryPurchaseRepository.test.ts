import { beforeEach, describe, expect, it } from "vitest";
import { Category } from "@/features/note/domain/Category";
import { Note } from "@/features/note/domain/Note";
import { NoteContent } from "@/features/note/domain/NoteContent";
import { NoteTitle } from "@/features/note/domain/NoteTitle";
import { Price } from "@/features/note/domain/Price";
import type { Result } from "@/shared/core/Result";
import { UserId } from "@/shared/domain/UserId";
import { Purchase } from "../../domain/Purchase";
import { PurchaseId } from "../../domain/PurchaseId";
import { InMemoryPurchaseRepository } from "../InMemoryPurchaseRepository";

describe("InMemoryPurchaseRepository (インメモリ購入リポジトリ)", () => {
	let repository: InMemoryPurchaseRepository;

	const unwrap = <T, E>(res: Result<T, E>): T => {
		if (!res.success) throw new Error("テストセットアップ失敗");
		return res.value;
	};

	const createPublishedNote = (
		authorId: UserId,
		priceAmount: number = 1000,
	) => {
		const note = Note.createDraft({
			authorId,
			title: unwrap(NoteTitle.create("テスト記事タイトル")),
			content: unwrap(
				NoteContent.createPaid({
					freeArea: "無料エリア本文12345",
					paidArea: "有料本文67890",
				}),
			),
			price: unwrap(Price.create(priceAmount)),
			category: unwrap(Category.create("ENGINEERING", "PROMPT")),
		});
		note.publish();
		return note;
	};

	beforeEach(() => {
		repository = new InMemoryPurchaseRepository();
	});

	it("購入集約を正常に保存し、IDで取得できること", async () => {
		const authorId = UserId.generate();
		const buyerId = UserId.generate();
		const note = createPublishedNote(authorId);

		const purchaseResult = Purchase.create({ note, buyerId });
		expect(purchaseResult.success).toBe(true);
		if (!purchaseResult.success) return;

		const purchase = purchaseResult.value;
		await repository.save(purchase);

		const found = await repository.findById(purchase.id);
		expect(found).not.toBeNull();
		expect(found?.id.equals(purchase.id)).toBe(true);
		expect(found?.noteId.equals(note.id)).toBe(true);
		expect(found?.buyerId.equals(buyerId)).toBe(true);
	});

	it("存在しない購入IDを指定した場合は null を返すこと", async () => {
		const unexistingId = PurchaseId.generate();
		const found = await repository.findById(unexistingId);

		expect(found).toBeNull();
	});

	it("hasPurchased で購入済み判定が正しく機能すること", async () => {
		const authorId = UserId.generate();
		const buyerId = UserId.generate();
		const otherUserId = UserId.generate();
		const note = createPublishedNote(authorId);

		const purchase = unwrap(Purchase.create({ note, buyerId }));
		await repository.save(purchase);

		// 購入したユーザーは true
		const hasPurchased = await repository.hasPurchased(buyerId, note.id);
		expect(hasPurchased).toBe(true);

		// 購入していない別ユーザーは false
		const otherHasPurchased = await repository.hasPurchased(
			otherUserId,
			note.id,
		);
		expect(otherHasPurchased).toBe(false);
	});

	it("findByBuyerId で特定の購入者の全購入履歴を取得できること", async () => {
		const authorId = UserId.generate();
		const buyerId = UserId.generate();
		const note1 = createPublishedNote(authorId, 500);
		const note2 = createPublishedNote(authorId, 1500);

		const purchase1 = unwrap(Purchase.create({ note: note1, buyerId }));
		const purchase2 = unwrap(Purchase.create({ note: note2, buyerId }));

		await repository.save(purchase1);
		await repository.save(purchase2);

		const buyerPurchases = await repository.findByBuyerId(buyerId);
		expect(buyerPurchases).toHaveLength(2);
	});

	it("clear() を実行すると全件削除されること", async () => {
		const authorId = UserId.generate();
		const buyerId = UserId.generate();
		const note = createPublishedNote(authorId);
		const purchase = unwrap(Purchase.create({ note, buyerId }));

		await repository.save(purchase);
		expect(await repository.findById(purchase.id)).not.toBeNull();

		repository.clear();
		expect(await repository.findById(purchase.id)).toBeNull();
	});
});
