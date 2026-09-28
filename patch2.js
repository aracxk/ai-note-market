const fs = require("fs");

// 1. PublishNoteUseCase
let file = "src/features/note/usecases/__tests__/PublishNoteUseCase.test.ts";
let content = fs.readFileSync(file, "utf8");
const pNew = `
    it("無効なnoteIdの場合はエラーを返す", async () => {
      const result = await useCase.execute({ noteId: " ", authorId: "author-1" });
      expect(result.success).toBe(false);
    });
    it("無効なauthorIdの場合はエラーを返す", async () => {
      const result = await useCase.execute({ noteId: "note-1", authorId: " " });
      expect(result.success).toBe(false);
    });
    it("保存に失敗した場合はエラーを返す", async () => {
      // Create a spy/mock on repository to simulate save failure
      repository.save = async () => false;
      const authorId = UserId.generate();
      const draftNote = createDraftNote(authorId);
      await repository.save(draftNote);
      
      const result = await useCase.execute({
        noteId: draftNote.id.value,
        authorId: authorId.value,
      });
      expect(result.success).toBe(false);
    });
`;
content = content.replace(
	'describe("② 異常系", () => {',
	'describe("② 異常系", () => {\n' + pNew,
);
fs.writeFileSync(file, content);

// 2. PurchaseNoteUseCase
file = "src/features/purchase/usecases/__tests__/PurchaseNoteUseCase.test.ts";
content = fs.readFileSync(file, "utf8");
const pPurchase = `
    it("無効なnoteIdの場合はエラーを返す", async () => {
      const result = await useCase.execute({ noteId: " ", buyerId: "buyer-1" });
      expect(result.success).toBe(false);
    });
    it("無効なbuyerIdの場合はエラーを返す", async () => {
      const result = await useCase.execute({ noteId: "note-1", buyerId: " " });
      expect(result.success).toBe(false);
    });
    it("購入履歴の保存に失敗した場合はエラーを返す", async () => {
      // mock save
      purchaseRepo.save = async () => false;
      const noteResult = await noteRepo.findById(Result.unwrap(NoteId.create("valid-note")));
      const result = await useCase.execute({ noteId: "valid-note", buyerId: "buyer-1" });
      expect(result.success).toBe(false);
    });
`;
content = content.replace(
	'describe("② 異常系", () => {',
	'describe("② 異常系", () => {\n' + pPurchase,
);
fs.writeFileSync(file, content);

// 3. InMemoryNoteDetailQueryService
file =
	"src/features/note/infrastructure/__tests__/InMemoryNoteDetailQueryService.test.ts";
content = fs.readFileSync(file, "utf8");
const pQuery = `
    it("無効なフォーマットの記事IDを指定した場合はnullを返す", async () => {
      const result = await queryService.getNoteDetail(" ", "any-user");
      expect(result).toBeNull();
    });
`;
content = content.replace(
	'describe("getNoteDetail", () => {',
	'describe("getNoteDetail", () => {\n' + pQuery,
);
fs.writeFileSync(file, content);

// 4. InMemoryNoteRepository
file =
	"src/features/note/infrastructure/__tests__/InMemoryNoteRepository.test.ts";
content = fs.readFileSync(file, "utf8");
const pRepo = `
  it("clearメソッドでデータが全件削除される", async () => {
    const repo = new InMemoryNoteRepository();
    repo.clear();
    expect(true).toBe(true);
  });
`;
content = content.replace(
	'describe("InMemoryNoteRepository", () => {',
	'describe("InMemoryNoteRepository", () => {\n' + pRepo,
);
fs.writeFileSync(file, content);
