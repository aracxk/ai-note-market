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

			{/* 本文領域（Typography プラグインで美しくレンダリング） */}
			<div className="prose prose-lg prose-gray max-w-none mx-auto leading-relaxed text-gray-800">
				<p className="first-letter:text-5xl first-letter:font-bold first-letter:mr-1 first-letter:float-left">
					この記事では、次世代のAIアーキテクチャについて深く解説します。
					これまで私たちが当たり前だと思っていたソフトウェア設計のパラダイムは、
					大規模言語モデル（LLM）の台頭により根底から覆されようとしています。
				</p>
				<p>
					本稿では、最新の実務事例を交えながら、クリーンアーキテクチャとAIエージェントを
					いかに融合させるか、その具体的な手法とベストプラクティスを余すところなく公開します。
				</p>

				{/* 課金壁（ペイウォール） */}
				{!isPurchased && (
					<div className="relative mt-16">
						{/* ぼかしエフェクトのかかったダミーテキスト */}
						<div className="absolute inset-0 bg-gradient-to-b from-transparent to-white pointer-events-none z-10" />
						<div className="blur-sm opacity-40 select-none" aria-hidden="true">
							<p>
								ここから先は有料部分のシミュレーションです。
								高度な技術解説や、実際のプロダクションで利用している
								門外不出のソースコードなどが記述されています。
								これを読むことであなたのエンジニアリングスキルは飛躍的に向上するでしょう。
							</p>
						</div>

						{/* 購入ボタンUI */}
						<div className="relative z-20 -mt-10 mx-auto max-w-md bg-white border border-gray-200 shadow-xl rounded-2xl p-8 text-center space-y-6">
							<div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4">
								🔒
							</div>
							<div>
								<h3 className="text-xl font-bold text-gray-900 mb-2">
									この続きを読むには
								</h3>
								<p className="text-sm text-gray-500">
									この記事は有料設定されています。購入すると、すべての内容とソースコードにアクセスできます。
								</p>
							</div>
							<PurchaseButton noteId={note.id} price={note.price} />
						</div>
					</div>
				)}

				{/* 有料部分（購入済みの場合のみ表示） */}
				{isPurchased && (
					<div className="mt-12 pt-12 border-t-2 border-gray-100">
						<h2>【有料部分】高度なアーキテクチャ実装</h2>
						<p>
							ご購入ありがとうございます。
							ここからは、実際のプロジェクトで利用している具体的な実装パターンについて解説します。
							（※本来は note.content の全文を表示します）
						</p>
					</div>
				)}
			</div>
		</article>
	);
}
