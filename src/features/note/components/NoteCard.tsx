import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { NoteSummaryDto } from "@/features/note/queries/INoteSummaryQueryService";

export function NoteCard({ note }: { note: NoteSummaryDto }) {
	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader>
				<CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
				<div className="text-sm text-gray-500 mt-2">
					{note.category} • 作者: {note.authorId}
				</div>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-gray-600 line-clamp-3">
					このノートはAIに関する専門的な知見がまとめられています。
				</p>
			</CardContent>
			<CardFooter className="flex justify-between items-center">
				<div className="font-bold text-lg">
					{note.price === 0 ? "無料" : `¥${note.price.toLocaleString()}`}
				</div>
				<Link href={`/notes/${note.noteId}`}>
					<Button variant="outline">詳細を見る</Button>
				</Link>
			</CardFooter>
		</Card>
	);
}
