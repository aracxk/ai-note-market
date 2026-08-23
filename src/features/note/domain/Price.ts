import { Result } from "@/shared/core/Result";
import { DomainError } from "@/shared/domain/DomainError";

/**
 * 価格が不正な範囲・形式の場合のドメインエラー
 */
export class InvalidPriceError extends DomainError {
  readonly code = "INVALID_PRICE_RANGE" as const;

  constructor(value: number) {
    super(
      `価格は0円（無料）、または${Price.MIN_AMOUNT}円〜${Price.MAX_AMOUNT}円の範囲（整数）で指定してください。入力値: ${value}`
    );
  }
}

/**
 * 記事の価格を表す値オブジェクト（Value Object）
 *
 * 不変条件（ビジネスルール）:
 * - 0円（無料）または 100円〜50,000円
 * - 整数値のみ許容（小数は不可）
 */
export class Price {
  public static readonly FREE_AMOUNT = 0;
  public static readonly MIN_AMOUNT = 100;
  public static readonly MAX_AMOUNT = 50000;

  private constructor(private readonly value: number) {}

  /**
   * Price インスタンスを安全に生成する静的ファクトリメソッド
   */
  public static create(value: number): Result<Price, InvalidPriceError> {
    // 整数チェック
    if (!Number.isInteger(value)) {
      return Result.err(new InvalidPriceError(value));
    }

    // 範囲チェック（0円 または 100円〜50,000円）
    if (
      value !== Price.FREE_AMOUNT &&
      (value < Price.MIN_AMOUNT || value > Price.MAX_AMOUNT)
    ) {
      return Result.err(new InvalidPriceError(value));
    }

    return Result.ok(new Price(value));
  }

  /**
   * 無料記事かどうかを判定する
   */
  public isFree(): boolean {
    return this.value === Price.FREE_AMOUNT;
  }

  /**
   * 値オブジェクトの同値性を判定する
   */
  public equals(other: Price): boolean {
    return this.value === other.value;
  }

  /**
   * 金額（数値）を取得する
   */
  public get amount(): number {
    return this.value;
  }
}
