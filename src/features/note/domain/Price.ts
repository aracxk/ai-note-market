import { Result } from "@/shared/core/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { DOMAIN_ERROR_CODES } from "@/shared/domain/DomainErrorCode";
import { ValueObject } from "@/shared/domain/ValueObject";

/**
 * 価格が不正な範囲・形式の場合のドメインエラー
 */
export class InvalidPriceError extends DomainError {
	readonly code = DOMAIN_ERROR_CODES.INVALID_PRICE_RANGE;

	constructor(value: number) {
		super(
			`価格は0円（無料）、または${Price.MIN_AMOUNT}円〜${Price.MAX_AMOUNT}円の範囲（整数）で指定してください。入力値: ${value}`,
		);
	}
}

/**
 * 記事の価格を表す値オブジェクト（Value Object）
 *
 * 不変条件（ビジネスルール）:
 * - 0円（無料）または 100円〜100,000円
 * - 整数値のみ許容（小数は不可）
 *
 * パフォーマンス最適化:
 * - 0円（無料）のインスタンスは Flyweight パターンにより 1 つのみ生成し使い回す。
 */
export class Price extends ValueObject {
	public static readonly FREE_AMOUNT = 0;
	public static readonly MIN_AMOUNT = 100;
	public static readonly MAX_AMOUNT = 100000;

	// 0円のインスタンスをキャッシュとして事前に1個だけ保持（Flyweightパターン）
	private static readonly ZERO = new Price(Price.FREE_AMOUNT);

	private constructor(private readonly value: number) {
		super();
	}

	/**
	 * Price インスタンスを安全に生成する静的ファクトリメソッド
	 */
	public static create(value: number): Result<Price, InvalidPriceError> {
		// 整数チェック
		if (!Number.isInteger(value)) {
			return Result.err(new InvalidPriceError(value));
		}

		// 範囲チェック（0円 または 100円〜100,000円）
		if (
			value !== Price.FREE_AMOUNT &&
			(value < Price.MIN_AMOUNT || value > Price.MAX_AMOUNT)
		) {
			return Result.err(new InvalidPriceError(value));
		}

		// 0円（無料）の場合はキャッシュインスタンスを返却してメモリ消費を抑える
		if (value === Price.FREE_AMOUNT) {
			return Result.ok(Price.ZERO);
		}

		return Result.ok(new Price(value));
	}

	/**
	 * 無料の Price インスタンスを直接取得するファクトリメソッド
	 */
	public static free(): Price {
		return Price.ZERO;
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
