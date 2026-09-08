import { describe, it, expect, beforeEach } from "vitest";
import { Result } from "@/shared/core/Result";
import { UserId } from "@/shared/domain/UserId";
import { Category } from "../../domain/Category";
import { Note } from "../../domain/Note";
import { NoteContent } from "../../domain/NoteContent";
import { NoteId } from "../../domain/NoteId";
import { NoteTitle } from "../../domain/NoteTitle";
import { Price } from "../../domain/Price";
import { InMemoryNoteRepository } from "../InMemoryNoteRepository";

describe("InMemoryNoteRepository (インメモリ記事リポジトリ)", () => {
	let repository: InMemoryNoteRepository;

	const unwrap = <T, E>(res: Result<T, E>): T => {
		if (!res.success) throw new Error("テストセットアップ失敗");
		return res.value;
	};

	const createDummyNote = (authorId: UserId) => {
		return Note.createDraft({
			authorId,
			title: unwrap(NoteTitle.create("テスト記事タイトル")),
			content: unwrap(NoteContent.createFree("無料エリア本文12345")),
			price: Price.free(),
			category: unwrap(Category.create("ENGINEERING", "PROMPT")),
		});
	};

	beforeEach(() => {
		repository = new InMemoryNoteRepository();
	});

	it("save() で記事を保存し、findById() で取得できること", async () => {
		const authorId = UserId.generate();
		const note = createDummyNote(authorId);

		await repository.save(note);

		const retrieved = await repository.findById(note.id);
		expect(retrieved).not.toBeNull();
		expect(retrieved?.id.equals(note.id)).toBe(true);
		expect(retrieved?.title.value).toBe("テスト記事タイトル");
	});

	it("存在しない NoteId で検索した場合は null を返すこと", async () => {
		const unexistingId = NoteId.generate();
		const result = await repository.findById(unexistingId);

		expect(result).toBeNull();
	});

	it("findByAuthorId() で特定の著者の記事のみを全件取得できること", async () => {
		const authorA = UserId.generate();
		const authorB = UserId.generate();

		const noteA1 = createDummyNote(authorA);
		const noteA2 = createDummyNote(authorA);
		const noteB1 = createDummyNote(authorB);

		await repository.save(noteA1);
		await repository.save(noteA2);
		await repository.save(noteB1);

		const notesOfA = await repository.findByAuthorId(authorA);
		expect(notesOfA).toHaveLength(2);
		expect(notesOfA.some((n: Note) => n.id.equals(noteA1.id))).toBe(true);
		expect(notesOfA.some((n: Note) => n.id.equals(noteA2.id))).toBe(true);

		const notesOfB = await repository.findByAuthorId(authorB);
		expect(notesOfB).toHaveLength(1);
		expect(notesOfB[0].id.equals(noteB1.id)).toBe(true);
	});
});
