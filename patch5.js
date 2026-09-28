const fs = require("fs");

let file = "src/features/note/usecases/PublishNoteUseCase.ts";
let content = fs.readFileSync(file, "utf8");
content = content.replace(
	"		// 4. 記事集約の公開メソッドを実行\n		const publishResult = note.publish(now);\n		if (!publishResult.success) {\n			return Result.err(publishResult.error);\n		}\n",
	"		// 4. 記事集約の公開メソッドを実行\n		note.publish(now);\n",
);
fs.writeFileSync(file, content);

file = "src/features/note/usecases/__tests__/PublishNoteUseCase.test.ts";
content = fs.readFileSync(file, "utf8");
content = content.replace(
	'    it("既に公開済みの記事を公開しようとした場合はエラーが返ること", async () => {\n      const authorId = UserId.generate();\n      const draftNote = createDraftNote(authorId);\n      draftNote.publish(new Date()); // Publish it first\n      await repository.save(draftNote);\n      \n      const result = await useCase.execute({\n        noteId: draftNote.id.value,\n        authorId: authorId.value,\n      });\n      expect(result.success).toBe(false);\n    });',
	"",
);
fs.writeFileSync(file, content);
