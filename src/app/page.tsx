import { NoteList } from "@/features/note/components/NoteList";
import { InMemoryNoteRepository } from "@/features/note/infrastructure/InMemoryNoteRepository";
import { InMemoryNoteSummaryQueryService } from "@/features/note/infrastructure/InMemoryNoteSummaryQueryService";

// デモ用としてインメモリのサービスを直接インスタンス化しています。
const noteRepository = new InMemoryNoteRepository();
const queryService = new InMemoryNoteSummaryQueryService(noteRepository);

export default async function HomePage() {
	const notes = await queryService.findPublishedNotes(20, 0);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">すべての記事</h1>
				<p className="text-gray-500 mt-2">
					最新のAIノートをチェックしましょう。
				</p>
			</div>

			<NoteList notes={notes} />
		</div>
	);
}
