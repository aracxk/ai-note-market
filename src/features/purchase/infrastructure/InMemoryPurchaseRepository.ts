import { UserId } from "@/shared/domain/UserId";
import { NoteId } from "@/features/note/domain/NoteId";
import { IPurchaseRepository } from "../usecases/IPurchaseRepository";
import { Purchase } from "../domain/Purchase";
import { PurchaseId } from "../domain/PurchaseId";

/**
 * テスト・開発用のインメモリ購入リポジトリ (InMemoryPurchaseRepository)
 *
 * 責務:
 * - IPurchaseRepository を実装し、Map（メモリ）上で購入データの保存・検索を行う。
 * - 外部データベース（PostgreSQL/Prisma等）を起動せずに、
 *   UseCase の単体テストを数ミリ秒で高速実行可能にする。
 */
export class InMemoryPurchaseRepository implements IPurchaseRepository {
	private readonly purchases = new Map<string, Purchase>();

	/**
	 * 購入データをメモリ内に保存（作成または上書き）する
	 */
	public async save(purchase: Purchase): Promise<void> {
		this.purchases.set(purchase.id.value, purchase);
	}

	/**
	 * 購入IDでメモリ内を検索する
	 */
	public async findById(id: PurchaseId): Promise<Purchase | null> {
		const found = this.purchases.get(id.value);
		return found ?? null;
	}

	/**
	 * 指定したユーザーが対象の記事を既に購入済みかどうかを判定する
	 */
	public async hasPurchased(buyerId: UserId, noteId: NoteId): Promise<boolean> {
		for (const purchase of this.purchases.values()) {
			if (purchase.buyerId.equals(buyerId) && purchase.noteId.equals(noteId)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 購入者IDでメモリ内をフィルタリングして全件取得する
	 */
	public async findByBuyerId(buyerId: UserId): Promise<Purchase[]> {
		return Array.from(this.purchases.values()).filter((p) =>
			p.buyerId.equals(buyerId),
		);
	}

	/**
	 * テスト間のデータ分離用のヘルパーメソッド（全件クリア）
	 */
	public clear(): void {
		this.purchases.clear();
	}
}
