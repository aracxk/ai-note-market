import { Result } from "@/shared/core/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { DOMAIN_ERROR_CODES } from "@/shared/domain/DomainErrorCode";
import { Entity } from "@/shared/domain/Entity";
import { UserId } from "@/shared/domain/UserId";
import { Category } from "./Category";
import { NoteContent } from "./NoteContent";
import { NoteId } from "./NoteId";
import { NOTE_STATUS, NoteStatus } from "./NoteStatus";
import { NoteTitle } from "./NoteTitle";
import { Price } from "./Price";

/**
 * 不正な状態遷移を試みた場合のドメインエラー
 */
export class InvalidNoteStatusTransitionError extends DomainError {
	readonly code = DOMAIN_ERROR_CODES.INVALID_NOTE_STATUS_TRANSITION;

	constructor(message: string) {
		super(message);
	}
}

/**
 * 記事集約ルート（Note Aggregate Root / Entity）
 *
 * 責務:
 * - 記事の執筆・編集・公開・販売停止・価格改定などのライフサイクルを統括する。
 * - 記事内のすべての部品（Title, Content, Price, Category）の整合性を維持する。
 * - 有料エリアの閲覧認可（アクセス権判定）を行う。
 */
export class Note extends Entity<NoteId> {
	private constructor(
		id: NoteId,
		private readonly _authorId: UserId,
		private _title: NoteTitle,
		private _content: NoteContent,
		private _price: Price,
		private _category: Category,
		private _status: NoteStatus,
		private readonly _createdAt: Date,
		private _updatedAt: Date,
	) {
		super(id);
	}

	/**
	 * 新規下書き記事を作成する（初期ステータス: DRAFT）
	 */
	public static createDraft(params: {
		id?: NoteId;
		authorId: UserId;
		title: NoteTitle;
		content: NoteContent;
		price: Price;
		category: Category;
		createdAt?: Date;
	}): Note {
		const now = params.createdAt ?? new Date();
		return new Note(
			params.id ?? NoteId.generate(),
			params.authorId,
			params.title,
			params.content,
			params.price,
			params.category,
			NOTE_STATUS.DRAFT,
			now,
			now,
		);
	}

	/**
	 * DB等の永続化層から既存の記事エンティティを復元する（リポジトリ用）
	 */
	public static reconstruct(params: {
		id: NoteId;
		authorId: UserId;
		title: NoteTitle;
		content: NoteContent;
		price: Price;
		category: Category;
		status: NoteStatus;
		createdAt: Date;
		updatedAt: Date;
	}): Note {
		return new Note(
			params.id,
			params.authorId,
			params.title,
			params.content,
			params.price,
			params.category,
			params.status,
			params.createdAt,
			params.updatedAt,
		);
	}

	/**
	 * 記事を公開状態にする（DRAFT / ARCHIVED -> PUBLISHED）
	 */
	public publish(
		now: Date = new Date(),
	): Result<void, InvalidNoteStatusTransitionError> {
		if (this._status === NOTE_STATUS.PUBLISHED) {
			return Result.ok(undefined); // 既に公開済みの場合は冪等に成功
		}

		this._status = NOTE_STATUS.PUBLISHED;
		this._updatedAt = now;
		return Result.ok(undefined);
	}

	/**
	 * 記事の販売を停止（アーカイブ）する（PUBLISHED -> ARCHIVED）
	 */
	public archive(
		now: Date = new Date(),
	): Result<void, InvalidNoteStatusTransitionError> {
		if (this._status === NOTE_STATUS.ARCHIVED) {
			return Result.ok(undefined); // 既に停止済みの場合は冪等に成功
		}

		this._status = NOTE_STATUS.ARCHIVED;
		this._updatedAt = now;
		return Result.ok(undefined);
	}

	/**
	 * 記事タイトルを更新する
	 */
	public updateTitle(newTitle: NoteTitle, now: Date = new Date()): void {
		this._title = newTitle;
		this._updatedAt = now;
	}

	/**
	 * 記事本文を更新する
	 */
	public updateContent(newContent: NoteContent, now: Date = new Date()): void {
		this._content = newContent;
		this._updatedAt = now;
	}

	/**
	 * 記事価格を改定する
	 */
	public updatePrice(newPrice: Price, now: Date = new Date()): void {
		this._price = newPrice;
		this._updatedAt = now;
	}

	/**
	 * 記事カテゴリを更新する
	 */
	public updateCategory(newCategory: Category, now: Date = new Date()): void {
		this._category = newCategory;
		this._updatedAt = now;
	}

	/**
	 * 現在新規に購入可能な状態かどうかを判定する
	 */
	public isPurchasable(): boolean {
		return this._status === NOTE_STATUS.PUBLISHED;
	}

	/**
	 * 指定したユーザーが有料エリアを閲覧可能かどうかを判定する
	 *
	 * 認可ルール:
	 * 1. 著者本人であれば常に閲覧可能。
	 * 2. 無料記事の場合: 公開中（PUBLISHED）であれば誰でも閲覧可能。
	 * 3. 有料記事の場合: 購入履歴がある（hasPurchased === true）ならば、記事が販売停止（ARCHIVED）であっても閲覧可能。
	 */
	public canReadPaidArea(userId: UserId, hasPurchased: boolean): boolean {
		// 著者本人は下書き・公開・停止問わずいつでも閲覧可能
		if (this._authorId.equals(userId)) {
			return true;
		}

		// 無料記事の場合
		if (this._price.isFree()) {
			return this._status === NOTE_STATUS.PUBLISHED;
		}

		// 有料記事の場合: 購入済みであれば閲覧可能（販売停止後も既得権益として維持）
		return hasPurchased;
	}

	// --- ゲッター一覧（id は Entity 基底クラスから継承） ---
	public get authorId(): UserId {
		return this._authorId;
	}

	public get title(): NoteTitle {
		return this._title;
	}

	public get content(): NoteContent {
		return this._content;
	}

	public get price(): Price {
		return this._price;
	}

	public get category(): Category {
		return this._category;
	}

	public get status(): NoteStatus {
		return this._status;
	}

	public get createdAt(): Date {
		return this._createdAt;
	}

	public get updatedAt(): Date {
		return this._updatedAt;
	}
}
