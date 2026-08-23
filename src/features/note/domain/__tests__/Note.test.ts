import { describe, it, expect } from "vitest";
import { Result } from "@/shared/core/Result";
import { UserId } from "@/shared/domain/UserId";
import { Category } from "../Category";
import { Note } from "../Note";
import { NoteContent } from "../NoteContent";
import { NoteId } from "../NoteId";
import { NOTE_STATUS } from "../NoteStatus";
import { NoteTitle } from "../NoteTitle";
import { Price } from "../Price";

describe("Note (記事 集約ルート)", () => {
  // テスト用アンラップヘルパー（型安全に value を取り出す）
  const unwrap = <T, E>(result: Result<T, E>): T => {
    if (!result.success) {
      throw new Error(`テスト準備失敗: ${JSON.stringify(result.error)}`);
    }
    return result.value;
  };

  // テスト用ヘルパー（Arrange の簡潔化）
  const createValidTestNote = (isPaid: boolean = true) => {
    const authorId = UserId.generate();
    const title = unwrap(NoteTitle.create("実戦 Cursor 活用ガイド"));
    const content = isPaid
      ? unwrap(
          NoteContent.createPaid({
            freeArea: "無料エリアの概要テキストです。",
            paidArea: "有料エリアのコアノウハウです。",
          })
        )
      : unwrap(NoteContent.createFree("無料記事の本文テキストです。"));
    const price = isPaid ? unwrap(Price.create(1500)) : Price.free();
    const category = unwrap(Category.create("ENGINEERING", "RULES_CONFIG"));

    return {
      note: Note.createDraft({
        authorId,
        title,
        content,
        price,
        category,
      }),
      authorId,
      title,
      content,
      price,
      category,
    };
  };

  describe("① 下書き作成 (createDraft)", () => {
    it("下書き記事がステータス DRAFT で正常に作成されること", () => {
      const { note, authorId, title, content, price, category } =
        createValidTestNote();

      expect(note.id).toBeInstanceOf(NoteId);
      expect(note.authorId.equals(authorId)).toBe(true);
      expect(note.title.equals(title)).toBe(true);
      expect(note.content.equals(content)).toBe(true);
      expect(note.price.equals(price)).toBe(true);
      expect(note.category.equals(category)).toBe(true);
      expect(note.status).toBe(NOTE_STATUS.DRAFT);
      expect(note.createdAt).toBeInstanceOf(Date);
      expect(note.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("② ライフサイクルと状態遷移 (publish / archive)", () => {
    it("下書きから公開 (PUBLISHED) に正常に遷移し、updatedAt が更新されること", () => {
      const { note } = createValidTestNote();
      const publishTime = new Date("2026-08-23T12:00:00Z");

      const result = note.publish(publishTime);

      expect(result.success).toBe(true);
      expect(note.status).toBe(NOTE_STATUS.PUBLISHED);
      expect(note.updatedAt).toEqual(publishTime);
    });

    it("すでに公開済みの状態で再度 publish しても冪等に成功すること", () => {
      const { note } = createValidTestNote();
      note.publish();

      const secondResult = note.publish();

      expect(secondResult.success).toBe(true);
      expect(note.status).toBe(NOTE_STATUS.PUBLISHED);
    });

    it("公開中から販売停止 (ARCHIVED) に正常に遷移すること", () => {
      const { note } = createValidTestNote();
      note.publish();
      const archiveTime = new Date("2026-08-23T13:00:00Z");

      const result = note.archive(archiveTime);

      expect(result.success).toBe(true);
      expect(note.status).toBe(NOTE_STATUS.ARCHIVED);
      expect(note.updatedAt).toEqual(archiveTime);
    });

    it("販売停止 (ARCHIVED) から再度公開 (PUBLISHED) に戻せること", () => {
      const { note } = createValidTestNote();
      note.publish();
      note.archive();

      const rePublishResult = note.publish();

      expect(rePublishResult.success).toBe(true);
      expect(note.status).toBe(NOTE_STATUS.PUBLISHED);
    });
  });

  describe("③ 記事内容の改定メソッド", () => {
    it("タイトルを更新できること", () => {
      const { note } = createValidTestNote();
      const newTitle = unwrap(NoteTitle.create("改定後の新しいタイトル"));
      const updateTime = new Date("2026-08-23T14:00:00Z");

      note.updateTitle(newTitle, updateTime);

      expect(note.title.equals(newTitle)).toBe(true);
      expect(note.updatedAt).toEqual(updateTime);
    });

    it("本文を更新できること", () => {
      const { note } = createValidTestNote();
      const newContent = unwrap(
        NoteContent.createPaid({
          freeArea: "改定された無料エリアです。",
          paidArea: "改定された有料エリアです。",
        })
      );
      const updateTime = new Date("2026-08-23T14:00:00Z");

      note.updateContent(newContent, updateTime);

      expect(note.content.equals(newContent)).toBe(true);
      expect(note.updatedAt).toEqual(updateTime);
    });

    it("価格を改定できること", () => {
      const { note } = createValidTestNote();
      const newPrice = unwrap(Price.create(3000));
      const updateTime = new Date("2026-08-23T14:00:00Z");

      note.updatePrice(newPrice, updateTime);

      expect(note.price.equals(newPrice)).toBe(true);
      expect(note.updatedAt).toEqual(updateTime);
    });

    it("カテゴリを更新できること", () => {
      const { note } = createValidTestNote();
      const newCategory = unwrap(Category.create("MARKETING", "PROMPT"));
      const updateTime = new Date("2026-08-23T14:00:00Z");

      note.updateCategory(newCategory, updateTime);

      expect(note.category.equals(newCategory)).toBe(true);
      expect(note.updatedAt).toEqual(updateTime);
    });
  });

  describe("④ 新規購入可否判定 (isPurchasable)", () => {
    it("公開中 (PUBLISHED) のみ true を返すこと", () => {
      const { note } = createValidTestNote();

      // DRAFT
      expect(note.isPurchasable()).toBe(false);

      // PUBLISHED
      note.publish();
      expect(note.isPurchasable()).toBe(true);

      // ARCHIVED
      note.archive();
      expect(note.isPurchasable()).toBe(false);
    });
  });

  describe("⑤ 有料エリア閲覧認可 (canReadPaidArea)", () => {
    it("著者本人は下書き・公開・停止に関わらずいつでも閲覧できること", () => {
      const { note, authorId } = createValidTestNote(true);

      // DRAFT でも閲覧可
      expect(note.canReadPaidArea(authorId, false)).toBe(true);

      // PUBLISHED でも閲覧可
      note.publish();
      expect(note.canReadPaidArea(authorId, false)).toBe(true);

      // ARCHIVED でも閲覧可
      note.archive();
      expect(note.canReadPaidArea(authorId, false)).toBe(true);
    });

    it("無料記事（公開中）は未購入の第三者でも閲覧できること", () => {
      const { note } = createValidTestNote(false); // 無料記事
      const otherUser = UserId.generate();

      // DRAFT の時は第三者は読めない
      expect(note.canReadPaidArea(otherUser, false)).toBe(false);

      // PUBLISHED になれば未購入でも誰でも読める
      note.publish();
      expect(note.canReadPaidArea(otherUser, false)).toBe(true);
    });

    it("有料記事（公開中）は購入者のみ閲覧でき、未購入者は閲覧できないこと", () => {
      const { note } = createValidTestNote(true); // 有料記事
      note.publish();
      const buyerUser = UserId.generate();
      const nonBuyerUser = UserId.generate();

      // 購入者 (hasPurchased: true) ➔ 閲覧可
      expect(note.canReadPaidArea(buyerUser, true)).toBe(true);

      // 未購入者 (hasPurchased: false) ➔ 閲覧不可
      expect(note.canReadPaidArea(nonBuyerUser, false)).toBe(false);
    });

    it("有料記事が販売停止 (ARCHIVED) になっても、既存購入者は閲覧権限を維持すること", () => {
      const { note } = createValidTestNote(true);
      note.publish();
      note.archive(); // 販売停止

      const buyerUser = UserId.generate();
      const nonBuyerUser = UserId.generate();

      // 既存購入者は引き続き閲覧可能
      expect(note.canReadPaidArea(buyerUser, true)).toBe(true);

      // 未購入者はもちろん閲覧不可
      expect(note.canReadPaidArea(nonBuyerUser, false)).toBe(false);
    });
  });

  describe("⑥ 復元 (reconstruct)", () => {
    it("DB等からの復元時にすべての値が正しく保持されること", () => {
      const id = NoteId.generate();
      const authorId = UserId.generate();
      const title = unwrap(NoteTitle.create("復元テストタイトル"));
      const content = unwrap(NoteContent.createFree("復元用の無料本文です。"));
      const price = Price.free();
      const category = unwrap(Category.create("DESIGN", "PROMPT"));
      const createdAt = new Date("2026-08-01T00:00:00Z");
      const updatedAt = new Date("2026-08-02T00:00:00Z");

      const note = Note.reconstruct({
        id,
        authorId,
        title,
        content,
        price,
        category,
        status: NOTE_STATUS.ARCHIVED,
        createdAt,
        updatedAt,
      });

      expect(note.id.equals(id)).toBe(true);
      expect(note.authorId.equals(authorId)).toBe(true);
      expect(note.status).toBe(NOTE_STATUS.ARCHIVED);
      expect(note.createdAt).toEqual(createdAt);
      expect(note.updatedAt).toEqual(updatedAt);
    });
  });
});
