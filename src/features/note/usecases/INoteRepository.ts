import type { UserId } from "@/shared/domain/UserId";
import type { Note } from "../domain/Note";
import type { NoteId } from "../domain/NoteId";

/**
 * 記事リポジトリ・インターフェース (INoteRepository)
 *
 * 責務:
 * - UseCase 層が外部の永続化層（DB/メモリ）に要求する接続口（ポート / Outgoing Port）を定義する。
 * - Clean Architecture (Ports & Adapters) の思想に基づき usecases/ 配下に配置することで、
 *   domain/ を純粋なビジネスモデルのみに保ち、DIP（依存性の逆転）を実現する。
 */
export interface INoteRepository {
	/**
	 * 記事集約を保存（新規作成または更新）する
	 */
	save(note: Note): Promise<void>;

	/**
	 * 記事IDを指定して記事集約を1件取得する（存在しない場合は null）
	 */
	findById(id: NoteId): Promise<Note | null>;

	/**
	 * 著者IDを指定して、その著者が執筆したすべての記事を取得する
	 */
	findByAuthorId(authorId: UserId): Promise<Note[]>;
}
