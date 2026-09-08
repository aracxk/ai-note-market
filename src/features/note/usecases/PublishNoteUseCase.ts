import { Result } from "@/shared/core/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { DOMAIN_ERROR_CODES } from "@/shared/domain/DomainErrorCode";
import { UserId } from "@/shared/domain/UserId";
import { INoteRepository } from "./INoteRepository";
import { NoteId } from "../domain/NoteId";
import { NoteStatus } from "../domain/NoteStatus";

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
 * 著者以外のユーザーが記事の公開・更新を試みた場合の認可エラー
 */
export class UnauthorizedNoteAccessError extends DomainError {
	readonly code = DOMAIN_ERROR_CODES.UNAUTHORIZED_NOTE_ACCESS;

	constructor() {
		super("記事の公開・編集は著者本人のみ実行可能です。");
	}
}

export type PublishNoteError =
	| NoteNotFoundError
	| UnauthorizedNoteAccessError
	| DomainError;

/**
 * 記事公開ユースケースの入力DTO
 */
export interface PublishNoteInput {
	noteId: string;
	authorId: string;
}

/**
 * 記事公開ユースケースの出力DTO
 */
export interface PublishNoteOutput {
	noteId: string;
	status: NoteStatus;
	publishedAt: Date;
}

/**
 * 記事公開ユースケース (PublishNoteUseCase)
 *
 * 責務:
 * - 下書き記事を公開（PUBLISHED）状態に変更し、DBに永続化する業務手順を統括する。
 * - 「記事の存在確認」「著者本人の認可チェック」「ドメインメソッド（publish）の実行」「永続化」を調整する。
 */
export class PublishNoteUseCase {
	constructor(private readonly noteRepository: INoteRepository) {}

	/**
	 * ユースケースを実行する
	 */
	public async execute(
		input: PublishNoteInput,
		now: Date = new Date(),
	): Promise<Result<PublishNoteOutput, PublishNoteError>> {
		// 1. 識別子の生成・バリデーション
		const noteIdResult = NoteId.create(input.noteId);
		if (!noteIdResult.success) {
			return Result.err(noteIdResult.error);
		}
		const noteId = noteIdResult.value;

		const authorIdResult = UserId.create(input.authorId);
		if (!authorIdResult.success) {
			return Result.err(authorIdResult.error);
		}
		const authorId = authorIdResult.value;

		// 2. リポジトリから対象の記事を取得
		const note = await this.noteRepository.findById(noteId);
		if (!note) {
			return Result.err(new NoteNotFoundError(input.noteId));
		}

		// 3. 著者本人の認可チェック
		if (!note.authorId.equals(authorId)) {
			return Result.err(new UnauthorizedNoteAccessError());
		}

		// 4. 記事集約の公開メソッドを実行
		const publishResult = note.publish(now);
		if (!publishResult.success) {
			return Result.err(publishResult.error);
		}

		// 5. 更新された集約をリポジトリへ保存
		await this.noteRepository.save(note);

		// 6. 出力DTOを返却
		return Result.ok({
			noteId: note.id.value,
			status: note.status,
			publishedAt: note.updatedAt,
		});
	}
}
