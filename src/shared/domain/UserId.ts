import { Result } from "@/shared/core/Result";
import { DomainError } from "./DomainError";
import { DOMAIN_ERROR_CODES } from "./DomainErrorCode";
import { ValueObject } from "./ValueObject";

/**
 * ユーザーIDの値が不正な場合のドメインエラー
 */
export class InvalidUserIdError extends DomainError {
	readonly code = DOMAIN_ERROR_CODES.INVALID_USER_ID;

	constructor(value: string) {
		super(`無効なユーザーIDです: "${value}"`);
	}
}

/**
 * プラットフォーム共通のユーザー識別子（Value Object）
 *
 * 不変条件:
 * - 空文字や空白のみは不可。
 * - UUID形式などを想定（文字列として保持）。
 * - 完全不変（Immutable）。
 */
export class UserId extends ValueObject {
	private constructor(public readonly value: string) {
		super();
	}

	/**
	 * ランダムな UUID から新しい UserId を自動採番する
	 */
	public static generate(): UserId {
		return new UserId(crypto.randomUUID());
	}

	/**
	 * 既存の文字列から UserId を生成・検証する（DBや認証からの復元用）
	 */
	public static create(value: string): Result<UserId, InvalidUserIdError> {
		const trimmed = value.trim();
		if (trimmed.length === 0) {
			return Result.err(new InvalidUserIdError(value));
		}
		return Result.ok(new UserId(trimmed));
	}

	/**
	 * 同値性の判定
	 */
	public equals(other: UserId): boolean {
		return this.value === other.value;
	}
}
