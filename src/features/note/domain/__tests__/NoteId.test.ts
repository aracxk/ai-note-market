import { describe, it, expect } from "vitest";
import { NoteId, InvalidNoteIdError } from "../NoteId";

describe("NoteId (記事識別子 Value Object)", () => {
  it("generate() で有効な UUID が生成されること", () => {
    const id = NoteId.generate();

    expect(id).toBeInstanceOf(NoteId);
    expect(id.value.length).toBeGreaterThan(0);
  });

  it("create() で有効な文字列からインスタンスを生成できること", () => {
    const rawId = "note-123-abc";
    const result = NoteId.create(rawId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.value).toBe(rawId);
    }
  });

  it("空文字や空白のみを指定した場合はエラーになること", () => {
    const resultEmpty = NoteId.create("");
    const resultBlank = NoteId.create("   ");

    expect(resultEmpty.success).toBe(false);
    if (!resultEmpty.success) {
      expect(resultEmpty.error).toBeInstanceOf(InvalidNoteIdError);
      expect(resultEmpty.error.code).toBe("INVALID_NOTE_ID");
    }

    expect(resultBlank.success).toBe(false);
    if (!resultBlank.success) {
      expect(resultBlank.error).toBeInstanceOf(InvalidNoteIdError);
    }
  });

  it("同じ値の NoteId 同士は equals() で true を返すこと", () => {
    const res1 = NoteId.create("note-abc");
    const res2 = NoteId.create("note-abc");

    expect(res1.success && res2.success).toBe(true);
    if (res1.success && res2.success) {
      expect(res1.value.equals(res2.value)).toBe(true);
    }
  });

  it("異なる値の NoteId 同士は equals() で false を返すこと", () => {
    const res1 = NoteId.create("note-1");
    const res2 = NoteId.create("note-2");

    expect(res1.success && res2.success).toBe(true);
    if (res1.success && res2.success) {
      expect(res1.value.equals(res2.value)).toBe(false);
    }
  });
});
