const fs = require("fs");

let file = "src/features/note/usecases/__tests__/PublishNoteUseCase.test.ts";
let content = fs.readFileSync(file, "utf8");
content = content.replace(
	'import { beforeEach, describe, expect, it } from "vitest";',
	'import { beforeEach, describe, expect, it, vi } from "vitest";',
);
content = content.replace(
	"repository.save = async () => false;",
	'vi.spyOn(repository, "save").mockResolvedValue(false);',
);
fs.writeFileSync(file, content);

file = "src/features/purchase/usecases/__tests__/PurchaseNoteUseCase.test.ts";
content = fs.readFileSync(file, "utf8");
content = content.replace(
	'import { beforeEach, describe, expect, it } from "vitest";',
	'import { beforeEach, describe, expect, it, vi } from "vitest";',
);
content = content.replace(
	"purchaseRepo.save = async () => false;",
	'vi.spyOn(purchaseRepo, "save").mockResolvedValue(false);',
);
fs.writeFileSync(file, content);

file =
	"src/features/note/infrastructure/__tests__/InMemoryNoteRepository.test.ts";
content = fs.readFileSync(file, "utf8");
content = content.replace(
	"expect(true).toBe(true);",
	'const noteResult = await repo.findById(Result.unwrap(NoteId.create("test-1")));\n    expect(noteResult).toBeNull();',
);
fs.writeFileSync(file, content);
