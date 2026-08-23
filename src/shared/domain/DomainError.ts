/**
 * ドメイン層で発生するビジネスルール違反エラーの共通基底クラス
 */
export abstract class DomainError extends Error {
  /**
   * 機械判別・ログ用の一意なエラーコード
   */
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // TypeScript/V8 環境でスタックトレースを正しく設定
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
