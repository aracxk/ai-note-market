import { Result } from "@/shared/core/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { DOMAIN_ERROR_CODES } from "@/shared/domain/DomainErrorCode";
import { ValueObject } from "@/shared/domain/ValueObject";

/**
 * 記事IDの値が不正な場合のドメインエラー
 */
export class InvalidNoteIdError extends DomainError {
	readonly code = DOMAIN_ERROR_CODES.INVALID_NOTE_ID;

	constructor(value: string) {
		super(`無効な記事IDです: "${value}"`);
	}
}

/**
 * 記事の一意な識別子（Value Object）
 *
 * 不変条件:
 * - 空文字や空白のみは不可。
 * - UUID形式などを想定。
 * - 完全不変（Immutable）。
 */
export class NoteId extends ValueObject {
	private constructor(public readonly value: string) {
		super();
	}

	/**
	 * ランダムな UUID から新しい NoteId を自動採番する
	 */
	public static generate(): NoteId {
		return new NoteId(crypto.randomUUID());
	}

	/**
	 * 既存の文字列から NoteId を生成・検証する（DBからの復元用）
	 */
	public static create(value: string): Result<NoteId, InvalidNoteIdError> {
		const trimmed = value.trim();
		if (trimmed.length === 0) {
			return Result.err(new InvalidNoteIdError(value));
		}
		return Result.ok(new NoteId(trimmed));
	}

	/**
	 * 同値性の判定
	 */
	public equals(other: NoteId): boolean {
		return this.value === other.value;
	}
}
