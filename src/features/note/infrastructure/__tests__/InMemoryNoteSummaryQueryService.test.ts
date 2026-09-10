import { beforeEach, describe, expect, it } from "vitest";
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
		const title = NoteTitle.create("Draft Note").value as NoteTitle;
		const content = NoteContent.createFree("Hello World Free Content")
			.value as NoteContent;
		const category = Category.create("ENGINEERING", "RULES_CONFIG")
			.value as Category;
		const price0 = Price.create(0).value as Price;
		const price100 = Price.create(100).value as Price;

		// 1. DRAFTの記事
		const draftNote = Note.createDraft({
			id: new NoteId("note-1"),
			authorId: new UserId("author-1"),
			title,
			content,
			price: price0,
			category,
		});
		await repository.save(draftNote);

		// 2. PUBLISHEDの記事 (古い)
		const publishedOld = Note.createDraft({
			id: new NoteId("note-2"),
			authorId: new UserId("author-1"),
			title,
			content,
			price: price100,
			category,
		});
		publishedOld.publish(new Date("2026-01-01T10:00:00Z"));
		await repository.save(publishedOld);

		// 3. PUBLISHEDの記事 (新しい)
		const publishedNew = Note.createDraft({
			id: new NoteId("note-3"),
			authorId: new UserId("author-2"),
			title,
			content,
			price: price0,
			category,
		});
		publishedNew.publish(new Date("2026-01-02T10:00:00Z"));
		await repository.save(publishedNew);

		// 4. ARCHIVEDの記事
		const archivedNote = Note.createDraft({
			id: new NoteId("note-4"),
			authorId: new UserId("author-1"),
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
});
