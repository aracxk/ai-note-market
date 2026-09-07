import { Result } from "@/shared/core/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { DOMAIN_ERROR_CODES } from "@/shared/domain/DomainErrorCode";
import { UserId } from "@/shared/domain/UserId";
import { INoteRepository } from "@/features/note/usecases/INoteRepository";
import { NoteId } from "@/features/note/domain/NoteId";
import {
  Purchase,
  CannotPurchaseOwnNoteError,
  NoteNotForSaleError,
} from "../domain/Purchase";
import { IPurchaseRepository } from "./IPurchaseRepository";

/**
 * 対象の記事が存在しない場合のドメインエラー
 */
export class NoteNotFoundError extends DomainError {
  readonly code = DOMAIN_ERROR_CODES.NOTE_NOT_FOUND;

  constructor(noteId: string) {
    super(`指定された記事が見つかりません: "${noteId}"`);
  }
}

/**
 * 既に購入済みの記事を再度購入しようとした場合のドメインエラー
 */
export class AlreadyPurchasedError extends DomainError {
  readonly code = DOMAIN_ERROR_CODES.ALREADY_PURCHASED;

  constructor() {
    super("この記事は既に購入済みです。");
  }
}

export type PurchaseNoteError =
  | NoteNotFoundError
  | AlreadyPurchasedError
  | CannotPurchaseOwnNoteError
  | NoteNotForSaleError
  | DomainError;

/**
 * 記事購入ユースケースの入力DTO
 */
export interface PurchaseNoteInput {
  buyerId: string;
  noteId: string;
  purchasedAt?: Date;
}

/**
 * 記事購入ユースケースの出力DTO
 */
export interface PurchaseNoteOutput {
  purchaseId: string;
  noteId: string;
  buyerId: string;
  purchasedPrice: number;
  purchasedAt: Date;
}

/**
 * 記事購入ユースケース (PurchaseNoteUseCase)
 *
 * 責務:
 * - ユーザーによる記事の購入取引を成立させ、永続化する業務手順を統括する。
 * - 「記事の存在確認」「二重購入の防止」「ドメイン集約（Purchase）の生成」「永続化」を調整する。
 */
export class PurchaseNoteUseCase {
  constructor(
    private readonly noteRepository: INoteRepository,
    private readonly purchaseRepository: IPurchaseRepository
  ) {}

  /**
   * ユースケースを実行する
   */
  public async execute(
    input: PurchaseNoteInput,
    now: Date = new Date()
  ): Promise<Result<PurchaseNoteOutput, PurchaseNoteError>> {
    // 1. 識別子の生成・バリデーション
    const buyerIdResult = UserId.create(input.buyerId);
    if (!buyerIdResult.success) {
      return Result.err(buyerIdResult.error);
    }
    const buyerId = buyerIdResult.value;

    const noteIdResult = NoteId.create(input.noteId);
    if (!noteIdResult.success) {
      return Result.err(noteIdResult.error);
    }
    const noteId = noteIdResult.value;

    // 2. リポジトリから対象の記事を取得
    const note = await this.noteRepository.findById(noteId);
    if (!note) {
      return Result.err(new NoteNotFoundError(input.noteId));
    }

    // 3. 二重購入の防止チェック
    const isAlreadyPurchased = await this.purchaseRepository.hasPurchased(
      buyerId,
      noteId
    );
    if (isAlreadyPurchased) {
      return Result.err(new AlreadyPurchasedError());
    }

    // 4. 購入集約の生成（自己購入禁止、販売状態の検証はドメイン側で自動実行）
    const purchaseResult = Purchase.create({
      note,
      buyerId,
      purchasedAt: input.purchasedAt ?? now,
    });
    if (!purchaseResult.success) {
      return Result.err(purchaseResult.error);
    }
    const purchase = purchaseResult.value;

    // 5. 更新された購入集約をリポジトリへ保存
    await this.purchaseRepository.save(purchase);

    // 6. 出力DTOを返却
    return Result.ok({
      purchaseId: purchase.id.value,
      noteId: purchase.noteId.value,
      buyerId: purchase.buyerId.value,
      purchasedPrice: purchase.purchasedPrice.amount,
      purchasedAt: purchase.purchasedAt,
    });
  }
}
