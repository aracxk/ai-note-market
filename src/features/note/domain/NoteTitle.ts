import { Result } from "@/shared/core/Result";
import { DomainError } from "@/shared/domain/DomainError";

/**
 * 記事タイトルの文字数が不正な場合のドメインエラー
 */
export class InvalidNoteTitleError extends DomainError {
  readonly code = "INVALID_NOTE_TITLE_LENGTH" as const;

  constructor(value: string) {
    super(
      `記事タイトルは${NoteTitle.MIN_LENGTH}文字以上、${NoteTitle.MAX_LENGTH}文字以内で指定してください。入力値: "${value}"`
    );
  }
}

/**
 * 記事タイトルを表す値オブジェクト（Value Object）
 *
 * 不変条件（ビジネスルール）:
 * - 5文字以上、100文字以内
 * - 前後の空白は自動トリム（trim）する
 * - 空白のみの文字列は不可
 */
export class NoteTitle {
  public static readonly MIN_LENGTH = 5;
  public static readonly MAX_LENGTH = 100;

  private constructor(private readonly rawValue: string) {}

  /**
   * NoteTitle インスタンスを安全に生成する静的ファクトリメソッド
   */
  public static create(value: string): Result<NoteTitle, InvalidNoteTitleError> {
    const trimmed = value.trim();

    if (
      trimmed.length < NoteTitle.MIN_LENGTH ||
      trimmed.length > NoteTitle.MAX_LENGTH
    ) {
      return Result.err(new InvalidNoteTitleError(value));
    }

    return Result.ok(new NoteTitle(trimmed));
  }

  /**
   * 値オブジェクトの同値性を判定する
   */
  public equals(other: NoteTitle): boolean {
    return this.rawValue === other.rawValue;
  }

  /**
   * トリム済みのタイトル文字列を取得する
   */
  public get value(): string {
    return this.rawValue;
  }
}
