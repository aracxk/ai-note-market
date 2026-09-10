import { beforeEach, describe, expect, it } from "vitest";
import type { Result } from "@/shared/core/Result";
import { UserId } from "@/shared/domain/UserId";
import { Category } from "../../../note/domain/Category";
import { Note } from "../../../note/domain/Note";
import { NoteContent } from "../../../note/domain/NoteContent";
import { NoteId } from "../../../note/domain/NoteId";
import { NoteTitle } from "../../../note/domain/NoteTitle";
import { Price } from "../../../note/domain/Price";
import { InMemoryNoteRepository } from "../../../note/infrastructure/InMemoryNoteRepository";
import { Purchase } from "../../domain/Purchase";
import { PurchaseId } from "../../domain/PurchaseId";
import { InMemoryPurchaseHistoryQueryService } from "../InMemoryPurchaseHistoryQueryService";
import { InMemoryPurchaseRepository } from "../InMemoryPurchaseRepository";

function unwrap<T, E>(result: Result<T, E>): T {
	if (!result.success) {
		throw new Error("Result is error: " + JSON.stringify(result.error));
	}
	return result.value;
}

describe("InMemoryPurchaseHistoryQueryService", () => {
	let purchaseRepository: InMemoryPurchaseRepository;
	let noteRepository: InMemoryNoteRepository;
	let queryService: InMemoryPurchaseHistoryQueryService;

	beforeEach(() => {
		purchaseRepository = new InMemoryPurchaseRepository();
		noteRepository = new InMemoryNoteRepository();
		queryService = new InMemoryPurchaseHistoryQueryService(
			purchaseRepository,
			noteRepository,
		);
	});

	it("購入履歴と記事タイトルが結合（JOIN）され、新しい順に取得できること", async () => {
		const buyerId = unwrap(UserId.create("buyer-1"));
		const title1 = unwrap(NoteTitle.create("Awesome TypeScript"));
		const title2 = unwrap(NoteTitle.create("Next.js Mastery"));
		const content = unwrap(
			NoteContent.createPaid({
				freeArea: "Free Content (10 chars minimum)",
				paidArea: "Paid Content",
			}),
		);
		const category = unwrap(Category.create("ENGINEERING", "RULES_CONFIG"));
		const price500 = unwrap(Price.create(500));
		const price1000 = unwrap(Price.create(1000));

		// 1. 記事データをセットアップ
		const note1 = Note.createDraft({
			id: unwrap(NoteId.create("note-1")),
			authorId: unwrap(UserId.create("author-1")),
			title: title1,
			content,
			price: price500,
			category,
		});
		await noteRepository.save(note1);

		const note2 = Note.createDraft({
			id: unwrap(NoteId.create("note-2")),
			authorId: unwrap(UserId.create("author-2")),
			title: title2,
			content,
			price: price1000,
			category,
		});
		await noteRepository.save(note2);

		// 2. 購入履歴データをセットアップ
		const purchase1 = Purchase.reconstruct({
			id: unwrap(PurchaseId.create("purchase-1")),
			noteId: unwrap(NoteId.create("note-1")),
			buyerId: buyerId,
			purchasedPrice: price500,
			purchasedAt: new Date("2026-08-01T10:00:00Z"),
		});
		await purchaseRepository.save(purchase1);

		const purchase2 = Purchase.reconstruct({
			id: unwrap(PurchaseId.create("purchase-2")),
			noteId: unwrap(NoteId.create("note-2")),
			buyerId: buyerId,
			purchasedPrice: price1000,
			purchasedAt: new Date("2026-08-02T10:00:00Z"), // こちらのほうが新しい
		});
		await purchaseRepository.save(purchase2);

		// 3. クエリサービス実行
		const result = await queryService.findByBuyerId("buyer-1");

		// 4. 検証
		expect(result).toHaveLength(2);
		expect(result[0].purchaseId).toBe("purchase-2");
		expect(result[0].noteTitle).toBe("Next.js Mastery"); // JOIN されたタイトル
		expect(result[1].purchaseId).toBe("purchase-1");
	});

	it("購入履歴に紐づく記事が存在しない場合はその履歴をスキップすること", async () => {
		const buyerId = unwrap(UserId.create("buyer-missing-note"));

		// 記事データはリポジトリに保存しない（存在しない状態にする）
		const purchase = Purchase.reconstruct({
			id: unwrap(PurchaseId.create("purchase-missing")),
			noteId: unwrap(NoteId.create("note-missing")), // 存在しない記事ID
			buyerId: buyerId,
			purchasedPrice: unwrap(Price.create(500)),
			purchasedAt: new Date(),
		});
		await purchaseRepository.save(purchase);

		const result = await queryService.findByBuyerId(buyerId.value);

		// 記事が見つからないためスキップされ、結果は0件になること
		expect(result).toHaveLength(0);
	});
});
