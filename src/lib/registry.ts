import { Category } from "@/features/note/domain/Category";
import { Note } from "@/features/note/domain/Note";
import { NoteContent } from "@/features/note/domain/NoteContent";
import { NoteId } from "@/features/note/domain/NoteId";
import { NOTE_STATUS } from "@/features/note/domain/NoteStatus";
import { NoteTitle } from "@/features/note/domain/NoteTitle";
import { Price } from "@/features/note/domain/Price";
import { InMemoryNoteDetailQueryService } from "@/features/note/infrastructure/InMemoryNoteDetailQueryService";
import { InMemoryNoteRepository } from "@/features/note/infrastructure/InMemoryNoteRepository";
import { InMemoryNoteSummaryQueryService } from "@/features/note/infrastructure/InMemoryNoteSummaryQueryService";
import { InMemoryPurchaseRepository } from "@/features/purchase/infrastructure/InMemoryPurchaseRepository";
import { PurchaseNoteUseCase } from "@/features/purchase/usecases/PurchaseNoteUseCase";
import { UserId } from "@/shared/domain/UserId";

const createInitialData = (noteRepo: InMemoryNoteRepository) => {
	const idRes = NoteId.create("demo-note-1");
	const authorIdRes = UserId.create("iorirac");
	const titleRes = NoteTitle.create(
		"AIを活用した次世代フロントエンドアーキテクチャ",
	);
	const contentRes = NoteContent.create({
		freeArea: "無料エリアです。ここに記事の導入が書かれます。",
		paidArea: "有料エリアです。具体的なプロンプトは...",
		isPaid: true,
	});
	const priceRes = Price.create(500);
	const catRes = Category.create("ENGINEERING", "PROMPT");

	if (
		idRes.success &&
		authorIdRes.success &&
		titleRes.success &&
		contentRes.success &&
		priceRes.success &&
		catRes.success
	) {
		const note = Note.reconstruct({
			id: idRes.value,
			authorId: authorIdRes.value,
			title: titleRes.value,
			content: contentRes.value,
			price: priceRes.value,
			category: catRes.value,
			status: NOTE_STATUS.PUBLISHED,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		noteRepo.save(note);
	}
};

const setupRegistry = () => {
	const noteRepo = new InMemoryNoteRepository();
	const purchaseRepo = new InMemoryPurchaseRepository();

	createInitialData(noteRepo);

	const purchaseUseCase = new PurchaseNoteUseCase(noteRepo, purchaseRepo);
	const noteSummaryQueryService = new InMemoryNoteSummaryQueryService(noteRepo);
	const noteDetailQueryService = new InMemoryNoteDetailQueryService(
		noteRepo,
		purchaseRepo,
	);

	return {
		purchaseUseCase,
		noteSummaryQueryService,
		noteDetailQueryService,
	};
};

const globalForRegistry = globalThis as unknown as {
	registry: ReturnType<typeof setupRegistry>;
};

export const registry = globalForRegistry.registry || setupRegistry();

if (process.env.NODE_ENV !== "production") {
	globalForRegistry.registry = registry;
}
