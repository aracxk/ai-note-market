export interface NoteSummaryDto {
	readonly noteId: string;
	readonly authorId: string;
	readonly title: string;
	readonly price: number;
	readonly category: string;
	readonly publishedAt: Date;
}

export interface INoteSummaryQueryService {
	/**
	 * 公開中（PUBLISHED）の記事一覧を公開日時の降順（新しい順）で取得する
	 * @param limit 取得件数の上限
	 * @param offset ページネーション用のオフセット
	 */
	findPublishedNotes(
		limit?: number,
		offset?: number,
	): Promise<NoteSummaryDto[]>;
}
