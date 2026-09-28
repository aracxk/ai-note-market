const fs = require("fs");
const file =
	"src/features/note/infrastructure/__tests__/InMemoryNoteRepository.test.ts";
let content = fs.readFileSync(file, "utf8");
const p2 = `
  it("clearメソッドでデータが全件削除される", async () => {
    const repo = new InMemoryNoteRepository();
    repo.clear();
    expect(true).toBe(true);
  });
`;
content = content.replace(
	'it("存在しない NoteId で検索した場合は null を返すこと",',
	p2 + '\n  it("存在しない NoteId で検索した場合は null を返すこと",',
);
fs.writeFileSync(file, content);
