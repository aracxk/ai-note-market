const fs = require("fs");

const file =
	"src/features/purchase/usecases/__tests__/PurchaseNoteUseCase.test.ts";
let content = fs.readFileSync(file, "utf8");
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
	'describe("② 異常系（業務ルール・バリデーション違反）", () => {',
	'describe("② 異常系（業務ルール・バリデーション違反）", () => {\n' +
		purchaseTests,
);
fs.writeFileSync(file, content);
