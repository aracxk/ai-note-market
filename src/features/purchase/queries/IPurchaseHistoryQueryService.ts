export interface PurchaseHistoryDto {
	readonly purchaseId: string;
	readonly noteId: string;
	readonly noteTitle: string;
	readonly authorId: string;
	readonly price: number;
	readonly purchasedAt: Date;
}

export interface IPurchaseHistoryQueryService {
	/**
	 * 指定したユーザー（購入者）の購入履歴一覧を購入日時の降順（新しい順）で取得する
	 * @param buyerId 購入者のユーザーID
	 */
	findByBuyerId(buyerId: string): Promise<PurchaseHistoryDto[]>;
}
