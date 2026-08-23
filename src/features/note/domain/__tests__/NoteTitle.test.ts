import { describe, it, expect } from "vitest";
import { NoteTitle, InvalidNoteTitleError } from "../NoteTitle";

describe("NoteTitle (記事タイトル Value Object)", () => {
  describe("正常系", () => {
    it("下限値（5文字）のタイトルを正常に生成できること", () => {
      // Arrange
      const input = "12345";

      // Act
      const result = NoteTitle.create(input);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe("12345");
      }
    });

    it("上限値（100文字）のタイトルを正常に生成できること", () => {
      // Arrange
      const input = "a".repeat(100);

      // Act
      const result = NoteTitle.create(input);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(input);
      }
    });

    it("前後に空白が含まれる場合、自動トリムされて正常に生成できること", () => {
      // Arrange
      const input = "   Claude Skills実践ガイド   ";

      // Act
      const result = NoteTitle.create(input);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe("Claude Skills実践ガイド");
      }
    });

    it("同じ文字列の NoteTitle インスタンス同士は equals() で true を返すこと", () => {
      // Arrange
      const titleA = NoteTitle.create("Claude入門ガイド");
      const titleB = NoteTitle.create("Claude入門ガイド");

      // Assert
      expect(titleA.success && titleB.success).toBe(true);
      if (titleA.success && titleB.success) {
        expect(titleA.value.equals(titleB.value)).toBe(true);
      }
    });

    it("異なる文字列の NoteTitle インスタンス同士は equals() で false を返すこと", () => {
      // Arrange
      const titleA = NoteTitle.create("Claude入門ガイド");
      const titleB = NoteTitle.create("Gemini活用ガイド");

      // Assert
      expect(titleA.success && titleB.success).toBe(true);
      if (titleA.success && titleB.success) {
        expect(titleA.value.equals(titleB.value)).toBe(false);
      }
    });
  });

  describe("異常系（ビジネスルール違反）", () => {
    it("4文字以下（下限未満）の場合はエラーになること", () => {
      // Arrange
      const input = "1234";

      // Act
      const result = NoteTitle.create(input);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InvalidNoteTitleError);
        expect(result.error.code).toBe("INVALID_NOTE_TITLE_LENGTH");
      }
    });

    it("101文字以上（上限超過）の場合はエラーになること", () => {
      // Arrange
      const input = "a".repeat(101);

      // Act
      const result = NoteTitle.create(input);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InvalidNoteTitleError);
        expect(result.error.code).toBe("INVALID_NOTE_TITLE_LENGTH");
      }
    });

    it("空文字の場合はエラーになること", () => {
      // Arrange
      const input = "";

      // Act
      const result = NoteTitle.create(input);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InvalidNoteTitleError);
        expect(result.error.code).toBe("INVALID_NOTE_TITLE_LENGTH");
      }
    });

    it("空白のみの文字列（トリム後0文字）の場合はエラーになること", () => {
      // Arrange
      const input = "     ";

      // Act
      const result = NoteTitle.create(input);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(InvalidNoteTitleError);
        expect(result.error.code).toBe("INVALID_NOTE_TITLE_LENGTH");
      }
    });
  });
});
