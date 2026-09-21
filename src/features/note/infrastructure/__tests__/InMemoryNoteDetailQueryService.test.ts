import { beforeEach, describe, expect, it } from "vitest";
import { Purchase } from "@/features/purchase/domain/Purchase";
import { InMemoryPurchaseRepository } from "@/features/purchase/infrastructure/InMemoryPurchaseRepository";
import { Result } from "@/shared/core/Result";
import { UserId } from "@/shared/domain/UserId";
import { Category } from "../../domain/Category";
import { Note } from "../../domain/Note";
import { NoteContent } from "../../domain/NoteContent";
import { NoteId } from "../../domain/NoteId";
import { NOTE_STATUS } from "../../domain/NoteStatus";
import { NoteTitle } from "../../domain/NoteTitle";
import { Price } from "../../domain/Price";
import { InMemoryNoteDetailQueryService } from "../InMemoryNoteDetailQueryService";
import { InMemoryNoteRepository } from "../InMemoryNoteRepository";

describe("InMemoryNoteDetailQueryService", () => {
	let noteRepo: InMemoryNoteRepository;
	let purchaseRepo: InMemoryPurchaseRepository;
	let queryService: InMemoryNoteDetailQueryService;

	beforeEach(() => {
		noteRepo = new InMemoryNoteRepository();
		purchaseRepo = new InMemoryPurchaseRepository();
		queryService = new InMemoryNoteDetailQueryService(noteRepo, purchaseRepo);

		const note = Note.reconstruct({
			id: Result.unwrap(NoteId.create("test-note-1")),
			authorId: Result.unwrap(UserId.create("author-user")),
			title: Result.unwrap(NoteTitle.create("テスト記事")),
			content: Result.unwrap(
				NoteContent.create({
					freeArea: "無料エリアのテキストです。",
					paidArea: "有料エリアのテキストです。",
					isPaid: true,
				}),
			),
			price: Result.unwrap(Price.create(500)),
			category: Result.unwrap(Category.create("ENGINEERING", "PROMPT")),
			status: NOTE_STATUS.PUBLISHED,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		noteRepo.save(note);
	});

	describe("getNoteDetail", () => {
		it("存在しない記事IDを指定した場合はnullを返す", async () => {
			const result = await queryService.getNoteDetail("not-exist", "any-user");
			expect(result).toBeNull();
		});

		it("未購入の一般ユーザーには無料エリアのみを返す", async () => {
			const result = await queryService.getNoteDetail(
				"test-note-1",
				"normal-user",
			);
			expect(result).not.toBeNull();
			expect(result?.content).toBe("無料エリアのテキストです。");
		});

		it("購入済みのユーザーには有料エリアも含めて返す", async () => {
			const noteResult = await noteRepo.findById(
				Result.unwrap(NoteId.create("test-note-1")),
			);
			const purchase = Result.unwrap(
				Purchase.create({
					note: noteResult!,
					buyerId: Result.unwrap(UserId.create("buyer-user")),
				}),
			);
			purchaseRepo.save(purchase);

			const result = await queryService.getNoteDetail(
				"test-note-1",
				"buyer-user",
			);
			expect(result?.content).toBe(
				"無料エリアのテキストです。\n\n---\n\n有料エリアのテキストです。",
			);
		});

		it("記事の著者自身には、未購入でも有料エリアを含めて返す", async () => {
			const result = await queryService.getNoteDetail(
				"test-note-1",
				"author-user",
			);
			expect(result?.content).toBe(
				"無料エリアのテキストです。\n\n---\n\n有料エリアのテキストです。",
			);
		});
	});

	describe("isPurchased", () => {
		it("無効なIDフォーマットの場合はfalseを返す", async () => {
			const result = await queryService.isPurchased(" ", "user");
			expect(result).toBe(false);
		});
	});
});
