import { PurchaseButton } from "@/features/purchase/components/PurchaseButton";

export function NoteDetail({
	note,
	isPurchased,
}: {
	note: {
		id: string;
		title: string;
		authorId: string;
		categoryId: string;
		price: number;
	};
	isPurchased: boolean;
}) {
	return (
		<div className="space-y-8 max-w-3xl mx-auto">
			<div className="border-b pb-6">
				<h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
					{note.title}
				</h1>
				<div className="flex items-center text-gray-500 gap-4 text-sm">
					<span>作者: {note.authorId}</span>
					<span>カテゴリ: {note.categoryId}</span>
				</div>
			</div>

			<div className="prose prose-gray max-w-none">
				<p>
					【無料公開部分】
					<br />
					この記事では、次世代のAIアーキテクチャについて深く解説します...
				</p>

				{!isPurchased && (
					<div className="mt-12 p-8 bg-gray-50 border rounded-lg text-center space-y-4">
						<h3 className="text-xl font-bold">続きをよむには購入が必要です</h3>
						<p className="text-gray-500">
							この記事は有料です。購入するとすべての内容を読むことができます。
						</p>
						<PurchaseButton noteId={note.id} price={note.price} />
					</div>
				)}

				{isPurchased && (
					<div className="mt-8 pt-8 border-t border-dashed">
						<p>
							【有料部分】
							<br />
							ここからが本題です。実は最新のモデルでは... （※本来は note.content
							の全文を表示します）
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
