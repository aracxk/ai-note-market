import { describe, expect, it } from "vitest";
import { Category } from "@/features/note/domain/Category";
import { Note } from "@/features/note/domain/Note";
import { NoteContent } from "@/features/note/domain/NoteContent";
import { NoteId } from "@/features/note/domain/NoteId";
import { NoteTitle } from "@/features/note/domain/NoteTitle";
import { Price } from "@/features/note/domain/Price";
import type { Result } from "@/shared/core/Result";
import { UserId } from "@/shared/domain/UserId";
import {
	CannotPurchaseOwnNoteError,
	NoteNotForSaleError,
	Purchase,
} from "../Purchase";
import { PurchaseId } from "../PurchaseId";

describe("Purchase (購入 集約ルート)", () => {
	// テスト用アンラップヘルパー
	const unwrap = <T, E>(result: Result<T, E>): T => {
		if (!result.success) {
			throw new Error(`テスト準備失敗: ${JSON.stringify(result.error)}`);
		}
		return result.value;
	};

	// テスト用ヘルパー（公開済みの記事を準備）
	const createPublishedNote = (priceAmount: number = 2000) => {
		const authorId = UserId.generate();
		const title = unwrap(NoteTitle.create("実戦 Claude プロンプト集"));
		const content = unwrap(
			NoteContent.createPaid({
				freeArea: "無料エリア本文12345",
				paidArea: "有料エリア本文12345",
			}),
		);
		const price = unwrap(Price.create(priceAmount));
		const category = unwrap(Category.create("ENGINEERING", "PROMPT"));

		const note = Note.createDraft({
			authorId,
			title,
			content,
			price,
			category,
		});

		note.publish(); // 公開状態にする

		return { note, authorId, price };
	};

	describe("① 正常な購入取引の成立 (Purchase.create)", () => {
		it("公開中の有料記事を第三者が正常に購入できること", () => {
			const { note, price } = createPublishedNote(2000);
			const buyerId = UserId.generate();
			const purchaseTime = new Date("2026-08-23T15:00:00Z");

			const result = Purchase.create({
				note,
				buyerId,
				purchasedAt: purchaseTime,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.id).toBeInstanceOf(PurchaseId);
				expect(result.value.noteId.equals(note.id)).toBe(true);
				expect(result.value.buyerId.equals(buyerId)).toBe(true);
				expect(result.value.purchasedPrice.equals(price)).toBe(true);
				expect(result.value.purchasedPrice.amount).toBe(2000);
				expect(result.value.purchasedAt).toEqual(purchaseTime);
			}
		});

		it("著者が後から記事を値上げしても、購入記録の purchasedPrice は過去の価格を保持すること（スナップショット保証）", () => {
			const { note } = createPublishedNote(2000);
			const buyerId = UserId.generate();

			// 2,000円で購入成立
			const purchase = unwrap(Purchase.create({ note, buyerId }));

			// その後、著者が記事を 5,000円 に値上げ！
			const newPrice = unwrap(Price.create(5000));
			note.updatePrice(newPrice);

			// 記事の現在価格は 5,000円 に変わっているが...
			expect(note.price.amount).toBe(5000);

			// ★ 購入記録（レシート）は元の 2,000円 のまま一切変わらない！
			expect(purchase.purchasedPrice.amount).toBe(2000);
		});
	});

	describe("② 異常系（ビジネスルール違反）", () => {
		it("著者が自分自身の記事を購入しようとした場合はエラーになること", () => {
			const { note, authorId } = createPublishedNote(2000);

			// buyerId に著者本人の ID を渡す
			const result = Purchase.create({
				note,
				buyerId: authorId,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(CannotPurchaseOwnNoteError);
				expect(result.error.code).toBe("CANNOT_PURCHASE_OWN_NOTE");
			}
		});

		it("下書き（DRAFT）状態の記事を購入しようとした場合はエラーになること", () => {
			const authorId = UserId.generate();
			const title = unwrap(NoteTitle.create("下書き記事タイトル"));
			const content = unwrap(NoteContent.createFree("無料エリア本文12345"));
			const price = Price.free();
			const category = unwrap(Category.create("OTHER", "PROMPT"));

			const draftNote = Note.createDraft({
				authorId,
				title,
				content,
				price,
				category,
			}); // publish() していない DRAFT 状態

			const buyerId = UserId.generate();
			const result = Purchase.create({ note: draftNote, buyerId });

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(NoteNotForSaleError);
				expect(result.error.code).toBe("NOTE_NOT_FOR_SALE");
			}
		});

		it("販売停止（ARCHIVED）状態の記事を購入しようとした場合はエラーになること", () => {
			const { note } = createPublishedNote(2000);
			note.archive(); // 販売停止状態にする

			const buyerId = UserId.generate();
			const result = Purchase.create({ note, buyerId });

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(NoteNotForSaleError);
				expect(result.error.code).toBe("NOTE_NOT_FOR_SALE");
			}
		});
	});

	describe("③ 復元 (reconstruct)", () => {
		it("DB等からの復元時にすべての値が正しく保持されること", () => {
			const id = PurchaseId.generate();
			const noteId = NoteId.generate();
			const buyerId = UserId.generate();
			const purchasedPrice = unwrap(Price.create(3000));
			const purchasedAt = new Date("2026-08-01T00:00:00Z");

			const purchase = Purchase.reconstruct({
				id,
				noteId,
				buyerId,
				purchasedPrice,
				purchasedAt,
			});

			expect(purchase.id.equals(id)).toBe(true);
			expect(purchase.noteId.equals(noteId)).toBe(true);
			expect(purchase.buyerId.equals(buyerId)).toBe(true);
			expect(purchase.purchasedPrice.equals(purchasedPrice)).toBe(true);
			expect(purchase.purchasedAt).toEqual(purchasedAt);
		});
	});
});
