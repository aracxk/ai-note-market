import { Result } from "@/shared/core/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { DOMAIN_ERROR_CODES } from "@/shared/domain/DomainErrorCode";
import { Entity } from "@/shared/domain/Entity";
import { UserId } from "@/shared/domain/UserId";
import { Note } from "@/features/note/domain/Note";
import { NoteId } from "@/features/note/domain/NoteId";
import { Price } from "@/features/note/domain/Price";
import { PurchaseId } from "./PurchaseId";

/**
 * 著者が自分自身の記事を購入しようとした場合のドメインエラー
 */
export class CannotPurchaseOwnNoteError extends DomainError {
	readonly code = DOMAIN_ERROR_CODES.CANNOT_PURCHASE_OWN_NOTE;

	constructor() {
		super("著者は自分自身の記事を購入することはできません。");
	}
}

/**
 * 販売中ではない記事を購入しようとした場合のドメインエラー
 */
export class NoteNotForSaleError extends DomainError {
	readonly code = DOMAIN_ERROR_CODES.NOTE_NOT_FOR_SALE;

	constructor() {
		super("この記事は現在販売されていません（下書きまたは販売停止中です）。");
	}
}

export type PurchaseCreationError =
	| CannotPurchaseOwnNoteError
	| NoteNotForSaleError;

/**
 * 購入集約ルート（Purchase Aggregate Root / Entity）
 *
 * 責務:
 * - 記事の購入取引の成立と、取引成立瞬間の完全不変な証跡（レシート・領収書）を管理する。
 * - 「自己購入の禁止」および「販売中ステータスの検証」を保証する。
 * - 購入成立時点の価格（purchasedPrice）をスナップショットとして固定保持する。
 */
export class Purchase extends Entity<PurchaseId> {
	private constructor(
		id: PurchaseId,
		private readonly _noteId: NoteId,
		private readonly _buyerId: UserId,
		private readonly _purchasedPrice: Price,
		private readonly _purchasedAt: Date,
	) {
		super(id);
	}

	/**
	 * 新しい購入取引を成立させ、Purchase インスタンスを生成する
	 *
	 * 不変条件（ビジネスルール）:
	 * 1. 自己購入の禁止: 著者は自分の記事を購入できない。
	 * 2. 販売状態の検証: 公開中（PUBLISHED）の記事のみ購入可能。
	 * 3. 価格スナップショットの固定: 取引時点の記事価格をコピーして保持する。
	 */
	public static create(params: {
		note: Note;
		buyerId: UserId;
		id?: PurchaseId;
		purchasedAt?: Date;
	}): Result<Purchase, PurchaseCreationError> {
		// 1. 自己購入の禁止チェック
		if (params.note.authorId.equals(params.buyerId)) {
			return Result.err(new CannotPurchaseOwnNoteError());
		}

		// 2. 販売状態のチェック
		if (!params.note.isPurchasable()) {
			return Result.err(new NoteNotForSaleError());
		}

		// 3. 価格スナップショットの固定とインスタンス生成
		const purchase = new Purchase(
			params.id ?? PurchaseId.generate(),
			params.note.id,
			params.buyerId,
			params.note.price,
			params.purchasedAt ?? new Date(),
		);

		return Result.ok(purchase);
	}

	/**
	 * DB等の永続化層から既存の購入エンティティを復元する（リポジトリ用）
	 */
	public static reconstruct(params: {
		id: PurchaseId;
		noteId: NoteId;
		buyerId: UserId;
		purchasedPrice: Price;
		purchasedAt: Date;
	}): Purchase {
		return new Purchase(
			params.id,
			params.noteId,
			params.buyerId,
			params.purchasedPrice,
			params.purchasedAt,
		);
	}

	// --- ゲッター一覧（id は Entity 基底クラスから継承） ---
	public get noteId(): NoteId {
		return this._noteId;
	}

	public get buyerId(): UserId {
		return this._buyerId;
	}

	public get purchasedPrice(): Price {
		return this._purchasedPrice;
	}

	public get purchasedAt(): Date {
		return this._purchasedAt;
	}
}
