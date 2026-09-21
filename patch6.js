const fs = require("fs");

// 1. PublishNoteUseCase
let file = "src/features/note/usecases/__tests__/PublishNoteUseCase.test.ts";
let content = fs.readFileSync(file, "utf8");
const publishTests = `
    it("無効なnoteIdの場合はエラーを返すこと", async () => {
      const result = await useCase.execute({ noteId: " ", authorId: "author-1" });
      expect(result.success).toBe(false);
    });
    it("無効なauthorIdの場合はエラーを返すこと", async () => {
      const result = await useCase.execute({ noteId: "note-1", authorId: " " });
      expect(result.success).toBe(false);
    });
`;
content = content.replace(
	'describe("② 異常系", () => {',
	'describe("② 異常系", () => {\n' + publishTests,
);
fs.writeFileSync(file, content);

// 2. PurchaseNoteUseCase
file = "src/features/purchase/usecases/__tests__/PurchaseNoteUseCase.test.ts";
content = fs.readFileSync(file, "utf8");
const purchaseTests = `
    it("無効なnoteIdの場合はエラーを返す", async () => {
      const result = await useCase.execute({ noteId: " ", buyerId: "buyer-1" });
      expect(result.success).toBe(false);
    });
    it("無効なbuyerIdの場合はエラーを返す", async () => {
      const result = await useCase.execute({ noteId: "note-1", buyerId: " " });
      expect(result.success).toBe(false);
    });
`;
content = content.replace(
	'describe("② 異常系", () => {',
	'describe("② 異常系", () => {\n' + purchaseTests,
);
fs.writeFileSync(file, content);

// 3. Vitest config revert to 100%
file = "vitest.config.ts";
content = fs.readFileSync(file, "utf8");
content = content.replace(/statements: 90/g, "statements: 100");
content = content.replace(/branches: 85/g, "branches: 100");
content = content.replace(/branches: 90/g, "branches: 100");
content = content.replace(/functions: 90/g, "functions: 100");
content = content.replace(/lines: 90/g, "lines: 100");
fs.writeFileSync(file, content);
