import { NOTE_STATUS } from "../../note/domain/NoteStatus";
import type {
	INoteSummaryQueryService,
	NoteSummaryDto,
} from "../queries/INoteSummaryQueryService";
import type { InMemoryNoteRepository } from "./InMemoryNoteRepository";

export class InMemoryNoteSummaryQueryService
	implements INoteSummaryQueryService
{
	constructor(private readonly noteRepository: InMemoryNoteRepository) {}

	public async findPublishedNotes(
		limit?: number,
		offset?: number,
	): Promise<NoteSummaryDto[]> {
		// 1. メモリ上の全記事を取得
		const allNotes = this.noteRepository.getAll();

		// 2. 公開中の記事だけをフィルタリングし、DTOに変換
		const publishedNotes = allNotes
			.filter((note) => note.status === NOTE_STATUS.PUBLISHED)
			.map((note) => ({
				noteId: note.id.value,
				authorId: note.authorId.value,
				title: note.title.value,
				price: note.price.amount,
				category: `${note.category.major}/${note.category.minor}`,
				publishedAt: note.updatedAt, // 公開日時は最終更新日時を代用
			}));

		// 3. 公開日時の降順（新しい順）でソート
		publishedNotes.sort(
			(a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
		);

		// 4. ページネーション（limit / offset）を適用
		const start = offset ?? 0;
		const end = limit !== undefined ? start + limit : undefined;

		return publishedNotes.slice(start, end);
	}
}
