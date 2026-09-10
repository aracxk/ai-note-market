import { beforeEach, describe, expect, it } from "vitest";
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
		const buyerId = new UserId("buyer-1");
		const title1 = NoteTitle.create("Awesome TypeScript").value as NoteTitle;
		const title2 = NoteTitle.create("Next.js Mastery").value as NoteTitle;
		const content = NoteContent.createPaid({
			freeArea: "Free Content (10 chars minimum)",
			paidArea: "Paid Content",
		}).value as NoteContent;
		const category = Category.create("ENGINEERING", "RULES_CONFIG")
			.value as Category;
		const price500 = Price.create(500).value as Price;
		const price1000 = Price.create(1000).value as Price;

		// 1. 記事データをセットアップ
		const note1 = Note.createDraft({
			id: new NoteId("note-1"),
			authorId: new UserId("author-1"),
			title: title1,
			content,
			price: price500,
			category,
		});
		await noteRepository.save(note1);

		const note2 = Note.createDraft({
			id: new NoteId("note-2"),
			authorId: new UserId("author-2"),
			title: title2,
			content,
			price: price1000,
			category,
		});
		await noteRepository.save(note2);

		// 2. 購入履歴データをセットアップ
		const purchase1 = Purchase.reconstruct({
			id: new PurchaseId("purchase-1"),
			noteId: new NoteId("note-1"),
			buyerId: buyerId,
			purchasedPrice: price500,
			purchasedAt: new Date("2026-08-01T10:00:00Z"),
		});
		await purchaseRepository.save(purchase1);

		const purchase2 = Purchase.reconstruct({
			id: new PurchaseId("purchase-2"),
			noteId: new NoteId("note-2"),
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
});
