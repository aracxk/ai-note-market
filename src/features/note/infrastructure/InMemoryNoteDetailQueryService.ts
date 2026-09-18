import type { InMemoryPurchaseRepository } from "@/features/purchase/infrastructure/InMemoryPurchaseRepository";
import { UserId } from "@/shared/domain/UserId";
import { NoteId } from "../domain/NoteId";
import type {
	INoteDetailQueryService,
	NoteDetailDto,
} from "../queries/INoteDetailQueryService";
import type { InMemoryNoteRepository } from "./InMemoryNoteRepository";

export class InMemoryNoteDetailQueryService implements INoteDetailQueryService {
	constructor(
		private readonly noteRepository: InMemoryNoteRepository,
		private readonly purchaseRepository: InMemoryPurchaseRepository,
	) {}

	async isPurchased(noteIdStr: string, userIdStr: string): Promise<boolean> {
		const noteIdResult = NoteId.create(noteIdStr);
		const userIdResult = UserId.create(userIdStr);

		if (!noteIdResult.success || !userIdResult.success) return false;

		return await this.purchaseRepository.hasPurchased(
			userIdResult.value,
			noteIdResult.value,
		);
	}

	async getNoteDetail(
		noteIdStr: string,
		userIdStr: string | null,
	): Promise<NoteDetailDto | null> {
		const noteIdResult = NoteId.create(noteIdStr);
		if (!noteIdResult.success) return null;

		const note = await this.noteRepository.findById(noteIdResult.value);
		if (!note) return null;

		let isPurchased = false;
		if (userIdStr) {
			isPurchased = await this.isPurchased(noteIdStr, userIdStr);
		}

		// 購入済みか、記事の著者が自分自身なら有料部分も返す
		const canReadPaidArea = isPurchased || userIdStr === note.authorId.value;

		return {
			id: note.id.value,
			title: note.title.value,
			authorId: note.authorId.value,
			categoryId: `${note.category.major}/${note.category.minor}`,
			price: note.price.amount,
			publishedAt: note.updatedAt.toISOString(),
			content:
				canReadPaidArea && note.content.paidArea
					? `${note.content.freeArea}\n\n---\n\n${note.content.paidArea}`
					: note.content.freeArea,
		};
	}
}
