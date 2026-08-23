import { describe, it, expect, beforeEach } from "vitest";
import { Result } from "@/shared/core/Result";
import { UserId } from "@/shared/domain/UserId";
import { Category } from "../../domain/Category";
import { Note } from "../../domain/Note";
import { NoteContent } from "../../domain/NoteContent";
import { NOTE_STATUS } from "../../domain/NoteStatus";
import { NoteTitle } from "../../domain/NoteTitle";
import { Price } from "../../domain/Price";
import { InMemoryNoteRepository } from "../../infrastructure/InMemoryNoteRepository";
import {
  PublishNoteUseCase,
  NoteNotFoundError,
  UnauthorizedNoteAccessError,
} from "../PublishNoteUseCase";

describe("PublishNoteUseCase (記事公開ユースケース)", () => {
  let repository: InMemoryNoteRepository;
  let useCase: PublishNoteUseCase;

  const unwrap = <T, E>(res: Result<T, E>): T => {
    if (!res.success) throw new Error("テストセットアップ失敗");
    return res.value;
  };

  const createDraftNote = (authorId: UserId) => {
    return Note.createDraft({
      authorId,
      title: unwrap(NoteTitle.create("公開対象の記事タイトル")),
      content: unwrap(NoteContent.createFree("無料エリア本文12345")),
      price: Price.free(),
      category: unwrap(Category.create("ENGINEERING", "PROMPT")),
    });
  };

  beforeEach(() => {
    repository = new InMemoryNoteRepository();
    useCase = new PublishNoteUseCase(repository);
  });

  describe("① 正常系", () => {
    it("下書き状態の記事を著者本人が正常に公開できること", async () => {
      const authorId = UserId.generate();
      const draftNote = createDraftNote(authorId);
      await repository.save(draftNote);

      const publishedAt = new Date("2026-08-23T18:00:00Z");

      const result = await useCase.execute(
        {
          noteId: draftNote.id.value,
          authorId: authorId.value,
        },
        publishedAt
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.noteId).toBe(draftNote.id.value);
        expect(result.value.status).toBe(NOTE_STATUS.PUBLISHED);
        expect(result.value.publishedAt).toEqual(publishedAt);
      }

      // リポジトリ内のデータも PUBLISHED に更新されていることを確認
      const savedNote = await repository.findById(draftNote.id);
      expect(savedNote?.status).toBe(NOTE_STATUS.PUBLISHED);
      expect(savedNote?.updatedAt).toEqual(publishedAt);
    });
  });

  describe("② 異常系", () => {
    it("存在しない記事IDを指定した場合は NoteNotFoundError が返ること", async () => {
      const authorId = UserId.generate();

      const result = await useCase.execute({
        noteId: "unexisting-note-id-123",
        authorId: authorId.value,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(NoteNotFoundError);
        expect(result.error.code).toBe("NOTE_NOT_FOUND");
      }
    });

    it("著者以外のユーザーが公開を試みた場合は UnauthorizedNoteAccessError が返ること", async () => {
      const authorId = UserId.generate();
      const otherUserId = UserId.generate();
      const draftNote = createDraftNote(authorId);
      await repository.save(draftNote);

      const result = await useCase.execute({
        noteId: draftNote.id.value,
        authorId: otherUserId.value, // 第三者のID
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(UnauthorizedNoteAccessError);
        expect(result.error.code).toBe("UNAUTHORIZED_NOTE_ACCESS");
      }

      // リポジトリ内のステータスが DRAFT のままであることを確認
      const savedNote = await repository.findById(draftNote.id);
      expect(savedNote?.status).toBe(NOTE_STATUS.DRAFT);
    });
  });
});
