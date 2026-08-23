import { Result } from "@/shared/core/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { DOMAIN_ERROR_CODES } from "@/shared/domain/DomainErrorCode";

/**
 * 無料エリア本文の文字数ルール違反エラー
 */
export class InvalidFreeAreaLengthError extends DomainError {
  readonly code = DOMAIN_ERROR_CODES.INVALID_FREE_AREA_LENGTH;

  constructor(length: number) {
    super(
      `無料エリア本文は${NoteContent.FREE_AREA_MIN_LENGTH}文字以上${NoteContent.FREE_AREA_MAX_LENGTH}文字以内で指定してください。（現在の文字数: ${length}文字）`
    );
  }
}

/**
 * 有料記事なのに有料エリア本文が未設定のエラー
 */
export class PaidAreaRequiredForPaidNoteError extends DomainError {
  readonly code = DOMAIN_ERROR_CODES.PAID_AREA_REQUIRED_FOR_PAID_NOTE;

  constructor() {
    super("有料記事には有料エリア本文の設定が必須です。");
  }
}

/**
 * 有料エリア本文の文字数ルール違反エラー
 */
export class InvalidPaidAreaLengthError extends DomainError {
  readonly code = DOMAIN_ERROR_CODES.INVALID_PAID_AREA_LENGTH;

  constructor(length: number) {
    super(
      `有料エリア本文は${NoteContent.PAID_AREA_MIN_LENGTH}文字以上${NoteContent.PAID_AREA_MAX_LENGTH}文字以内で指定してください。（現在の文字数: ${length}文字）`
    );
  }
}

export type NoteContentError =
  | InvalidFreeAreaLengthError
  | PaidAreaRequiredForPaidNoteError
  | InvalidPaidAreaLengthError;

/**
 * 記事本文を表す値オブジェクト（Value Object）
 *
 * 不変条件（ビジネスルール）:
 * - `freeArea`（無料エリア）: 必須。10文字以上 10,000文字以内（前後の空白は自動トリム）。
 * - `paidArea`（有料エリア）:
 *   - 無料記事の場合: 空文字（`""`）を許容。
 *   - 有料記事の場合: 必須。1文字以上 50,000文字以内。
 * - 完全不変（Immutable）。
 */
export class NoteContent {
  public static readonly FREE_AREA_MIN_LENGTH = 10;
  public static readonly FREE_AREA_MAX_LENGTH = 10000;
  public static readonly PAID_AREA_MIN_LENGTH = 1;
  public static readonly PAID_AREA_MAX_LENGTH = 50000;

  private constructor(
    public readonly freeArea: string,
    public readonly paidArea: string
  ) {}

  /**
   * 無料記事用の本文オブジェクトを安全に生成する
   */
  public static createFree(
    freeArea: string
  ): Result<NoteContent, InvalidFreeAreaLengthError> {
    const trimmedFree = freeArea.trim();

    if (
      trimmedFree.length < NoteContent.FREE_AREA_MIN_LENGTH ||
      trimmedFree.length > NoteContent.FREE_AREA_MAX_LENGTH
    ) {
      return Result.err(new InvalidFreeAreaLengthError(trimmedFree.length));
    }

    return Result.ok(new NoteContent(trimmedFree, ""));
  }

  /**
   * 有料記事用の本文オブジェクトを安全に生成する
   */
  public static createPaid(params: {
    freeArea: string;
    paidArea: string;
  }): Result<NoteContent, NoteContentError> {
    const trimmedFree = params.freeArea.trim();

    if (
      trimmedFree.length < NoteContent.FREE_AREA_MIN_LENGTH ||
      trimmedFree.length > NoteContent.FREE_AREA_MAX_LENGTH
    ) {
      return Result.err(new InvalidFreeAreaLengthError(trimmedFree.length));
    }

    const trimmedPaid = params.paidArea.trim();

    if (trimmedPaid.length === 0) {
      return Result.err(new PaidAreaRequiredForPaidNoteError());
    }

    if (trimmedPaid.length > NoteContent.PAID_AREA_MAX_LENGTH) {
      return Result.err(new InvalidPaidAreaLengthError(trimmedPaid.length));
    }

    return Result.ok(new NoteContent(trimmedFree, trimmedPaid));
  }

  /**
   * 汎用ファクトリメソッド（isPaid フラグに応じて検証を分岐）
   */
  public static create(params: {
    freeArea: string;
    paidArea?: string;
    isPaid: boolean;
  }): Result<NoteContent, NoteContentError> {
    if (params.isPaid) {
      return NoteContent.createPaid({
        freeArea: params.freeArea,
        paidArea: params.paidArea ?? "",
      });
    }

    return NoteContent.createFree(params.freeArea);
  }

  /**
   * 値オブジェクトの同値性を判定する
   */
  public equals(other: NoteContent): boolean {
    return (
      this.freeArea === other.freeArea && this.paidArea === other.paidArea
    );
  }
}
