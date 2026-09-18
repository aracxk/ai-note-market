import { NoteList } from "@/features/note/components/NoteList";
import { registry } from "@/lib/registry";

export default async function HomePage() {
	// Registryのクエリサービスから本物のインメモリデータを取得
	const notes = await registry.noteSummaryQueryService.findPublishedNotes(10);

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-extrabold tracking-tight">新着記事</h1>
				<p className="text-gray-500 mt-2">
					最新のAIやアーキテクチャに関する知見をチェックしましょう。
				</p>
			</div>

			<NoteList notes={notes} />
		</div>
	);
}
