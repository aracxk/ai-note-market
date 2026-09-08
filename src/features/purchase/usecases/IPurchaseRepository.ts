import { UserId } from "@/shared/domain/UserId";
import { NoteId } from "@/features/note/domain/NoteId";
import { Purchase } from "../domain/Purchase";
import { PurchaseId } from "../domain/PurchaseId";

/**
 * 購入リポジトリ・インターフェース (IPurchaseRepository)
 *
 * 責務:
 * - UseCase 層が外部の永続化層（DB/メモリ）に要求する接続口（ポート / Outgoing Port）を定義する。
 * - Clean Architecture (Ports & Adapters) の思想に基づき usecases/ 配下に配置することで、
 *   domain/ を純粋なビジネスモデルのみに保ち、DIP（依存性の逆転）を実現する。
 */
export interface IPurchaseRepository {
	/**
	 * 購入集約を保存する
	 */
	save(purchase: Purchase): Promise<void>;

	/**
	 * 購入IDを指定して購入集約を1件取得する（存在しない場合は null）
	 */
	findById(id: PurchaseId): Promise<Purchase | null>;

	/**
	 * 指定したユーザーが対象の記事を既に購入済みかどうかを判定する
	 */
	hasPurchased(buyerId: UserId, noteId: NoteId): Promise<boolean>;

	/**
	 * 購入者IDを指定して、そのユーザーの全購入履歴を取得する
	 */
	findByBuyerId(buyerId: UserId): Promise<Purchase[]>;
}
