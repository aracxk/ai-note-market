import { beforeEach, describe, expect, it } from "vitest";
import { Result } from "@/shared/core/Result";
import { UserId } from "@/shared/domain/UserId";
import { Category } from "../../domain/Category";
import { Note } from "../../domain/Note";
import { NoteContent } from "../../domain/NoteContent";
import { NoteId } from "../../domain/NoteId";
import { NoteTitle } from "../../domain/NoteTitle";
import { Price } from "../../domain/Price";
import { InMemoryNoteRepository } from "../InMemoryNoteRepository";
import { InMemoryNoteSummaryQueryService } from "../InMemoryNoteSummaryQueryService";

describe("InMemoryNoteSummaryQueryService", () => {
	let repository: InMemoryNoteRepository;
	let queryService: InMemoryNoteSummaryQueryService;

	beforeEach(() => {
		repository = new InMemoryNoteRepository();
		queryService = new InMemoryNoteSummaryQueryService(repository);
	});

	it("公開中（PUBLISHED）の記事のみを取得し、新しい順にソートすること", async () => {
		const title = Result.unwrap(NoteTitle.create("Draft Note"));
		const content = Result.unwrap(
			NoteContent.createFree("Hello World Free Content"),
		);
		const category = Result.unwrap(
			Category.create("ENGINEERING", "RULES_CONFIG"),
		);
		const price0 = Price.free();
		const price100 = Result.unwrap(Price.create(100));

		// 1. DRAFTの記事
		const draftNote = Note.createDraft({
			id: Result.unwrap(NoteId.create("note-1")),
			authorId: Result.unwrap(UserId.create("author-1")),
			title,
			content,
			price: price0,
			category,
		});
		await repository.save(draftNote);

		// 2. PUBLISHEDの記事 (古い)
		const publishedOld = Note.createDraft({
			id: Result.unwrap(NoteId.create("note-2")),
			authorId: Result.unwrap(UserId.create("author-1")),
			title,
			content,
			price: price100,
			category,
		});
		publishedOld.publish(new Date("2026-01-01T10:00:00Z"));
		await repository.save(publishedOld);

		// 3. PUBLISHEDの記事 (新しい)
		const publishedNew = Note.createDraft({
			id: Result.unwrap(NoteId.create("note-3")),
			authorId: Result.unwrap(UserId.create("author-2")),
			title,
			content,
			price: price0,
			category,
		});
		publishedNew.publish(new Date("2026-01-02T10:00:00Z"));
		await repository.save(publishedNew);

		// 4. ARCHIVEDの記事
		const archivedNote = Note.createDraft({
			id: Result.unwrap(NoteId.create("note-4")),
			authorId: Result.unwrap(UserId.create("author-1")),
			title,
			content,
			price: price0,
			category,
		});
		archivedNote.publish(new Date("2025-01-01T10:00:00Z"));
		archivedNote.archive(new Date("2025-02-01T10:00:00Z"));
		await repository.save(archivedNote);

		const result = await queryService.findPublishedNotes();

		// DRAFTとARCHIVEDは除外され、PUBLISHEDの2件のみ取得されること
		expect(result).toHaveLength(2);

		expect(result[0].noteId).toBe("note-3");
		expect(result[1].noteId).toBe("note-2");
	});

	it("ページネーション（limit / offset）が正しく適用されること", async () => {
		const title = Result.unwrap(NoteTitle.create("Page Note"));
		const content = Result.unwrap(
			NoteContent.createFree("Hello World Free Content"),
		);
		const category = Result.unwrap(
			Category.create("ENGINEERING", "RULES_CONFIG"),
		);
		const price0 = Price.free();

		// 3件のPUBLISHED記事を作成（1日ずつずらす）
		for (let i = 1; i <= 3; i++) {
			const note = Note.createDraft({
				id: Result.unwrap(NoteId.create(`page-note-${i}`)),
				authorId: Result.unwrap(UserId.create("author-1")),
				title,
				content,
				price: price0,
				category,
			});
			note.publish(new Date(`2026-01-0${i}T10:00:00Z`));
			await repository.save(note);
		}

		// 最新順なので、page-note-3, page-note-2, page-note-1 の順になる
		// offset: 1, limit: 1 を指定すると、2番目の page-note-2 のみ取得されるはず
		const result = await queryService.findPublishedNotes(1, 1);

		expect(result).toHaveLength(1);
		expect(result[0].noteId).toBe("page-note-2");
	});
});
