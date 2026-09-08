import { beforeEach, describe, expect, it } from "vitest";
import { Category } from "@/features/note/domain/Category";
import { Note } from "@/features/note/domain/Note";
import { NoteContent } from "@/features/note/domain/NoteContent";
import { NoteTitle } from "@/features/note/domain/NoteTitle";
import { Price } from "@/features/note/domain/Price";
import { InMemoryNoteRepository } from "@/features/note/infrastructure/InMemoryNoteRepository";
import type { Result } from "@/shared/core/Result";
import { UserId } from "@/shared/domain/UserId";
import {
	CannotPurchaseOwnNoteError,
	NoteNotForSaleError,
} from "../../domain/Purchase";
import { InMemoryPurchaseRepository } from "../../infrastructure/InMemoryPurchaseRepository";
import {
	AlreadyPurchasedError,
	NoteNotFoundError,
	PurchaseNoteUseCase,
} from "../PurchaseNoteUseCase";

describe("PurchaseNoteUseCase (記事購入ユースケース)", () => {
	let noteRepository: InMemoryNoteRepository;
	let purchaseRepository: InMemoryPurchaseRepository;
	let useCase: PurchaseNoteUseCase;

	const unwrap = <T, E>(res: Result<T, E>): T => {
		if (!res.success) throw new Error("テストセットアップ失敗");
		return res.value;
	};

	const createNote = (
		authorId: UserId,
		priceAmount: number = 1000,
		isPublished: boolean = true,
	) => {
		const note = Note.createDraft({
			authorId,
			title: unwrap(NoteTitle.create("テスト対象の記事タイトル")),
			content: unwrap(
				priceAmount === 0
					? NoteContent.createFree("無料エリア本文12345")
					: NoteContent.createPaid({
							freeArea: "無料エリア本文12345",
							paidArea: "有料エリア本文67890",
						}),
			),
			price: unwrap(Price.create(priceAmount)),
			category: unwrap(Category.create("ENGINEERING", "PROMPT")),
		});

		if (isPublished) {
			note.publish();
		}
		return note;
	};

	beforeEach(() => {
		noteRepository = new InMemoryNoteRepository();
		purchaseRepository = new InMemoryPurchaseRepository();
		useCase = new PurchaseNoteUseCase(noteRepository, purchaseRepository);
	});

	describe("① 正常系", () => {
		it("公開中の有料記事（1,000円）を正常に購入できること", async () => {
			// Arrange (準備)
			const authorId = UserId.generate();
			const buyerId = UserId.generate();
			const note = createNote(authorId, 1000, true);
			await noteRepository.save(note);

			const purchasedAt = new Date("2026-09-07T12:00:00Z");

			// Act (実行)
			const result = await useCase.execute(
				{
					noteId: note.id.value,
					buyerId: buyerId.value,
				},
				purchasedAt,
			);

			// Assert (検証)
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.noteId).toBe(note.id.value);
				expect(result.value.buyerId).toBe(buyerId.value);
				expect(result.value.purchasedPrice).toBe(1000);
				expect(result.value.purchasedAt).toEqual(purchasedAt);
			}

			// 購入リポジトリ内にデータが永続化されていることを確認
			const hasPurchased = await purchaseRepository.hasPurchased(
				buyerId,
				note.id,
			);
			expect(hasPurchased).toBe(true);
		});

		it("公開中の無料記事（0円）を正常に購入（取得）できること", async () => {
			// Arrange
			const authorId = UserId.generate();
			const buyerId = UserId.generate();
			const note = createNote(authorId, 0, true);
			await noteRepository.save(note);

			// Act
			const result = await useCase.execute({
				noteId: note.id.value,
				buyerId: buyerId.value,
			});

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.value.purchasedPrice).toBe(0);
			}

			const hasPurchased = await purchaseRepository.hasPurchased(
				buyerId,
				note.id,
			);
			expect(hasPurchased).toBe(true);
		});
	});

	describe("② 異常系（業務ルール・バリデーション違反）", () => {
		it("存在しない記事IDを指定した場合は NoteNotFoundError が返ること", async () => {
			const buyerId = UserId.generate();

			const result = await useCase.execute({
				noteId: "unexisting-note-id-123",
				buyerId: buyerId.value,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(NoteNotFoundError);
				expect(result.error.code).toBe("NOTE_NOT_FOUND");
			}
		});

		it("著者が自分自身の記事を購入しようとした場合は CannotPurchaseOwnNoteError が返ること", async () => {
			const authorId = UserId.generate();
			const note = createNote(authorId, 1000, true);
			await noteRepository.save(note);

			// 著者本人が購入を試行
			const result = await useCase.execute({
				noteId: note.id.value,
				buyerId: authorId.value,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(CannotPurchaseOwnNoteError);
				expect(result.error.code).toBe("CANNOT_PURCHASE_OWN_NOTE");
			}
		});

		it("下書き状態（DRAFT）の記事を購入しようとした場合は NoteNotForSaleError が返ること", async () => {
			const authorId = UserId.generate();
			const buyerId = UserId.generate();
			const draftNote = createNote(authorId, 1000, false); // isPublished = false
			await noteRepository.save(draftNote);

			const result = await useCase.execute({
				noteId: draftNote.id.value,
				buyerId: buyerId.value,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(NoteNotForSaleError);
				expect(result.error.code).toBe("NOTE_NOT_FOR_SALE");
			}
		});

		it("販売停止（ARCHIVED）の記事を購入しようとした場合は NoteNotForSaleError が返ること", async () => {
			const authorId = UserId.generate();
			const buyerId = UserId.generate();
			const note = createNote(authorId, 1000, true);
			note.archive(); // 販売停止に変更
			await noteRepository.save(note);

			const result = await useCase.execute({
				noteId: note.id.value,
				buyerId: buyerId.value,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeInstanceOf(NoteNotForSaleError);
				expect(result.error.code).toBe("NOTE_NOT_FOR_SALE");
			}
		});

		it("既に購入済みの記事を再度購入しようとした場合は AlreadyPurchasedError が返ること", async () => {
			const authorId = UserId.generate();
			const buyerId = UserId.generate();
			const note = createNote(authorId, 1000, true);
			await noteRepository.save(note);

			// 1回目の購入（成功）
			const firstResult = await useCase.execute({
				noteId: note.id.value,
				buyerId: buyerId.value,
			});
			expect(firstResult.success).toBe(true);

			// 2回目の購入試行（二重購入）
			const secondResult = await useCase.execute({
				noteId: note.id.value,
				buyerId: buyerId.value,
			});

			expect(secondResult.success).toBe(false);
			if (!secondResult.success) {
				expect(secondResult.error).toBeInstanceOf(AlreadyPurchasedError);
				expect(secondResult.error.code).toBe("ALREADY_PURCHASED");
			}
		});
	});
});
