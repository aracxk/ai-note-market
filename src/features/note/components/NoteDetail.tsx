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
		content: string;
	};
	isPurchased: boolean;
}) {
	return (
		<article className="space-y-10">
			{/* ヘッダー領域 */}
			<header className="space-y-6 text-center">
				<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-gray-900">
					{note.title}
				</h1>
				<div className="flex items-center justify-center gap-4 text-sm font-medium text-gray-500">
					<span className="flex items-center gap-1">
						<span className="bg-gray-100 px-3 py-1 rounded-full">
							@{note.authorId}
						</span>
					</span>
					<span>•</span>
					<span>カテゴリ: {note.categoryId}</span>
				</div>
			</header>

			{/* 本文領域 */}
			<div className="prose prose-lg prose-gray max-w-none mx-auto leading-relaxed text-gray-800">
				{/* サーバーから渡されたコンテンツをそのまま表示 */}
				<div className="whitespace-pre-wrap">{note.content}</div>

				{/* 課金壁（ペイウォール）未購入時のみ表示 */}
				{!isPurchased && (
					<div className="relative mt-16">
						<div className="absolute inset-0 bg-gradient-to-b from-transparent to-white pointer-events-none z-10" />
						<div className="blur-sm opacity-40 select-none" aria-hidden="true">
							<p>ここから先は有料部分です。</p>
						</div>

						<div className="relative z-20 -mt-10 mx-auto max-w-md bg-white border border-gray-200 shadow-xl rounded-2xl p-8 text-center space-y-6">
							<div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4">
								🔒
							</div>
							<div>
								<h3 className="text-xl font-bold text-gray-900 mb-2">
									この続きを読むには
								</h3>
								<p className="text-sm text-gray-500">
									この記事は有料設定されています。購入すると、すべての内容にアクセスできます。
								</p>
							</div>
							<PurchaseButton noteId={note.id} price={note.price} />
						</div>
					</div>
				)}
			</div>
		</article>
	);
}
