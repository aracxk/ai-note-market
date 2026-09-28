const fs = require("fs");

// 1. Fix PublishNoteUseCase
let file = "src/features/note/usecases/__tests__/PublishNoteUseCase.test.ts";
let content = fs.readFileSync(file, "utf8");
const newTests = `
  it("無効なnoteIdの場合はエラーを返す", async () => {
    const result = await useCase.execute({ ...validInput, noteId: "" });
    expect(result.success).toBe(false);
  });
  it("無効なauthorIdの場合はエラーを返す", async () => {
    const result = await useCase.execute({ ...validInput, authorId: "" });
    expect(result.success).toBe(false);
  });
  it("無効なtitleの場合はエラーを返す", async () => {
    const result = await useCase.execute({ ...validInput, title: "" });
    expect(result.success).toBe(false);
  });
`;
content = content.replace(
	'it("正常に記事を公開できる",',
	newTests + '\n  it("正常に記事を公開できる",',
);
fs.writeFileSync(file, content);

// 2. Fix PurchaseNoteUseCase
file = "src/features/purchase/usecases/__tests__/PurchaseNoteUseCase.test.ts";
content = fs.readFileSync(file, "utf8");
const newPurchaseTests = `
  it("無効なbuyerIdの場合はエラーを返す", async () => {
    const result = await useCase.execute({ noteId: "note-1", buyerId: "" });
    expect(result.success).toBe(false);
  });
  it("無効なnoteIdの場合はエラーを返す", async () => {
    const result = await useCase.execute({ noteId: "", buyerId: "buyer-1" });
    expect(result.success).toBe(false);
  });
`;
content = content.replace(
	'it("正常に記事を購入できる",',
	newPurchaseTests + '\n  it("正常に記事を購入できる",',
);
fs.writeFileSync(file, content);

// 3. Fix InMemoryNoteDetailQueryService
file =
	"src/features/note/infrastructure/__tests__/InMemoryNoteDetailQueryService.test.ts";
content = fs.readFileSync(file, "utf8");
content = content.replace(
	'it("存在しない記事IDを指定した場合はnullを返す", async () => {',
	'it("無効なフォーマットの記事IDを指定した場合はnullを返す", async () => {\n      const result = await queryService.getNoteDetail(" ", "any-user");\n      expect(result).toBeNull();\n    });\n\n    it("存在しない記事IDを指定した場合はnullを返す", async () => {',
);
fs.writeFileSync(file, content);

// 4. Fix InMemoryNoteRepository
file =
	"src/features/note/infrastructure/__tests__/InMemoryNoteRepository.test.ts";
content = fs.readFileSync(file, "utf8");
content = content.replace(
	'describe("InMemoryNoteRepository", () => {',
	'describe("InMemoryNoteRepository", () => {\n  it("clearメソッドでデータが全件削除される", async () => {\n    const repo = new InMemoryNoteRepository();\n    repo.save(createDummyNote("note-1"));\n    repo.clear();\n    const note = await repo.findById(Result.unwrap(NoteId.create("note-1")));\n    expect(note).toBeNull();\n  });\n',
);
fs.writeFileSync(file, content);
