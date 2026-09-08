import type { UserId } from "@/shared/domain/UserId";
import type { Note } from "../domain/Note";
import type { NoteId } from "../domain/NoteId";
import type { INoteRepository } from "../usecases/INoteRepository";

/**
 * テスト・開発用のインメモリ記事リポジトリ (InMemoryNoteRepository)
 *
 * 責務:
 * - INoteRepository を実装し、Map（メモリ）上で記事の保存・取得を行う。
 * - 外部データベース（PostgreSQL/Prisma等）を起動せずに、
 *   UseCase の単体テストを数ミリ秒で高速実行可能にする。
 */
export class InMemoryNoteRepository implements INoteRepository {
	private readonly notes = new Map<string, Note>();

	/**
	 * 記事をメモリ内に保存（作成または上書き）する
	 */
	public async save(note: Note): Promise<void> {
		this.notes.set(note.id.value, note);
	}

	/**
	 * 記事IDでメモリ内を検索する
	 */
	public async findById(id: NoteId): Promise<Note | null> {
		const found = this.notes.get(id.value);
		return found ?? null;
	}

	/**
	 * 著者IDでメモリ内をフィルタリングして取得する
	 */
	public async findByAuthorId(authorId: UserId): Promise<Note[]> {
		return Array.from(this.notes.values()).filter((n) =>
			n.authorId.equals(authorId),
		);
	}

	/**
	 * テスト間のデータ分離用のヘルパーメソッド（全件クリア）
	 */
	public clear(): void {
		this.notes.clear();
	}
}
