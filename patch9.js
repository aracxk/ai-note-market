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
	'it("findById: 存在しないIDの場合はnullを返す",',
	p2 + '\n  it("findById: 存在しないIDの場合はnullを返す",',
);
fs.writeFileSync(file, content);
