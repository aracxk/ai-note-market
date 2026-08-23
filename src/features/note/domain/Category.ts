import { Result } from "@/shared/core/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { DOMAIN_ERROR_CODES } from "@/shared/domain/DomainErrorCode";

/**
 * 大カテゴリ（目的・業務領域）
 */
export const MAJOR_CATEGORIES = [
  "ENGINEERING",
  "MARKETING",
  "DESIGN",
  "WRITING",
  "BUSINESS",
  "OTHER",
] as const;

export type MajorCategory = (typeof MAJOR_CATEGORIES)[number];

/**
 * 小カテゴリ（成果物の形式・アセット種別）
 */
export const MINOR_CATEGORIES = [
  "PROMPT",
  "RULES_CONFIG",
  "SKILLS_EXTENSION",
  "SOURCE_CODE",
  "WORKFLOW_GUIDE",
  "OTHER",
] as const;

export type MinorCategory = (typeof MINOR_CATEGORIES)[number];

/**
 * 不正なカテゴリ組み合わせ・無効な値の場合のドメインエラー
 */
export class InvalidCategoryCombinationError extends DomainError {
  readonly code = DOMAIN_ERROR_CODES.INVALID_CATEGORY_COMBINATION;

  constructor(major: string, minor: string) {
    super(
      `大カテゴリ "${major}" または小カテゴリ "${minor}" が無効な値です。`
    );
  }
}

/**
 * 記事の分類を表す値オブジェクト（Value Object）
 *
 * 不変条件（ビジネスルール）:
 * - 大カテゴリ（業務目的）× 小カテゴリ（成果物形式）の組み合わせで表現。
 * - 定義済みの MajorCategory および MinorCategory のみ許容。
 * - 完全不変（Immutable）。
 *
 * パフォーマンス最適化:
 * - 全組み合わせインスタンスをクラスロード時に事前に Flyweight キャッシュし、使い回す。
 */
export class Category {
  // Flyweight キャッシュマップ（"MAJOR:MINOR" -> Category インスタンス）
  private static readonly CACHE = new Map<string, Category>();

  static {
    // すべての有効な組み合わせを事前に1つずつ生成してキャッシュ
    for (const major of MAJOR_CATEGORIES) {
      for (const minor of MINOR_CATEGORIES) {
        const key = `${major}:${minor}`;
        Category.CACHE.set(key, new Category(major, minor));
      }
    }
  }

  private constructor(
    public readonly major: MajorCategory,
    public readonly minor: MinorCategory
  ) {}

  /**
   * Category インスタンスを安全に生成する静的ファクトリメソッド
   */
  public static create(
    major: MajorCategory,
    minor: MinorCategory
  ): Result<Category, InvalidCategoryCombinationError> {
    const key = `${major}:${minor}`;
    const cached = Category.CACHE.get(key);

    if (!cached) {
      return Result.err(new InvalidCategoryCombinationError(major, minor));
    }

    return Result.ok(cached);
  }

  /**
   * 値オブジェクトの同値性を判定する
   */
  public equals(other: Category): boolean {
    return this.major === other.major && this.minor === other.minor;
  }
}
