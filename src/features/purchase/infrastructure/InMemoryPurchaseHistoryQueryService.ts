import type { InMemoryNoteRepository } from "../../note/infrastructure/InMemoryNoteRepository";
import type {
	IPurchaseHistoryQueryService,
	PurchaseHistoryDto,
} from "../queries/IPurchaseHistoryQueryService";
import type { InMemoryPurchaseRepository } from "./InMemoryPurchaseRepository";

export class InMemoryPurchaseHistoryQueryService
	implements IPurchaseHistoryQueryService
{
	constructor(
		private readonly purchaseRepository: InMemoryPurchaseRepository,
		private readonly noteRepository: InMemoryNoteRepository,
	) {}

	public async findByBuyerId(buyerId: string): Promise<PurchaseHistoryDto[]> {
		// 1. 購入者の購入履歴を全件取得
		const purchases = this.purchaseRepository
			.getAll()
			.filter((p) => p.buyerId.value === buyerId);

		const dtos: PurchaseHistoryDto[] = [];
		const allNotes = this.noteRepository.getAll();

		// 2. 購入履歴と記事情報をインメモリで手動 JOIN する
		for (const purchase of purchases) {
			const note = allNotes.find((n) => n.id.equals(purchase.noteId));
			if (!note) {
				continue; // 記事が見つからない場合はスキップ（実際のDBでは外部キー制約で防ぐ）
			}

			dtos.push({
				purchaseId: purchase.id.value,
				noteId: note.id.value,
				noteTitle: note.title.value,
				authorId: note.authorId.value,
				price: purchase.purchasedPrice.amount, // 購入時の価格スナップショットを使う
				purchasedAt: purchase.purchasedAt,
			});
		}

		// 3. 購入日時の降順（新しい順）でソート
		dtos.sort((a, b) => b.purchasedAt.getTime() - a.purchasedAt.getTime());

		return dtos;
	}
}
