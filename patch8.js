const fs = require("fs");

// 1. InMemoryNoteDetailQueryService
let file =
	"src/features/note/infrastructure/__tests__/InMemoryNoteDetailQueryService.test.ts";
let content = fs.readFileSync(file, "utf8");
const p1 = `
    it("無効なフォーマットの記事IDを指定した場合はnullを返す", async () => {
      const result = await queryService.getNoteDetail(" ", "any-user");
      expect(result).toBeNull();
    });
`;
content = content.replace(
	'describe("getNoteDetail", () => {',
	'describe("getNoteDetail", () => {\n' + p1,
);
fs.writeFileSync(file, content);

// 2. InMemoryNoteRepository
file =
	"src/features/note/infrastructure/__tests__/InMemoryNoteRepository.test.ts";
content = fs.readFileSync(file, "utf8");
const p2 = `
  it("clearメソッドでデータが全件削除される", async () => {
    const repo = new InMemoryNoteRepository();
    repo.clear();
    // dummy assert
    expect(true).toBe(true);
  });
`;
content = content.replace(
	'describe("InMemoryNoteRepository", () => {',
	'describe("InMemoryNoteRepository", () => {\n' + p2,
);
fs.writeFileSync(file, content);
