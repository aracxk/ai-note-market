import type { NoteSummaryDto } from "@/features/note/queries/INoteSummaryQueryService";
import { NoteCard } from "./NoteCard";

export function NoteList({ notes }: { notes: NoteSummaryDto[] }) {
	if (notes.length === 0) {
		return (
			<div className="text-center text-gray-500 py-12">
				ノートが見つかりませんでした。
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{notes.map((note) => (
				<NoteCard key={note.noteId} note={note} />
			))}
		</div>
	);
}
