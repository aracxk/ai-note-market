export type NoteDetailDto = {
	id: string;
	title: string;
	authorId: string;
	categoryId: string;
	price: number;
	publishedAt: string;
	content: string; // isPurchasedがfalseなら無料エリアのみ、trueなら有料エリアも含む
};

export interface INoteDetailQueryService {
	getNoteDetail(
		noteId: string,
		userId: string | null,
	): Promise<NoteDetailDto | null>;
	isPurchased(noteId: string, userId: string): Promise<boolean>;
}
