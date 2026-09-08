import { Result } from "@/shared/core/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { DOMAIN_ERROR_CODES } from "@/shared/domain/DomainErrorCode";
import { ValueObject } from "@/shared/domain/ValueObject";

/**
 * 購入IDの値が不正な場合のドメインエラー
 */
export class InvalidPurchaseIdError extends DomainError {
	readonly code = DOMAIN_ERROR_CODES.INVALID_PURCHASE_ID;

	constructor(value: string) {
		super(`無効な購入IDです: "${value}"`);
	}
}

/**
 * 購入記録の一意な識別子（Value Object）
 *
 * 不変条件:
 * - 空文字や空白のみは不可。
 * - UUID形式などを想定。
 * - 完全不変（Immutable）。
 */
export class PurchaseId extends ValueObject {
	private constructor(public readonly value: string) {
		super();
	}

	/**
	 * ランダムな UUID から新しい PurchaseId を自動採番する
	 */
	public static generate(): PurchaseId {
		return new PurchaseId(crypto.randomUUID());
	}

	/**
	 * 既存の文字列から PurchaseId を生成・検証する（DBからの復元用）
	 */
	public static create(
		value: string,
	): Result<PurchaseId, InvalidPurchaseIdError> {
		const trimmed = value.trim();
		if (trimmed.length === 0) {
			return Result.err(new InvalidPurchaseIdError(value));
		}
		return Result.ok(new PurchaseId(trimmed));
	}

	/**
	 * 同値性の判定
	 */
	public equals(other: PurchaseId): boolean {
		return this.value === other.value;
	}
}
