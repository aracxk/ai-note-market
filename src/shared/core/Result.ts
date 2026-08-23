/**
 * 成功または失敗を表す汎用の Result 型
 *
 * @template T 成功時の値の型
 * @template E 失敗時のエラーの型
 */
export type Result<T, E> =
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly error: E };

/**
 * Result 型を簡単に生成するためのファクトリ関数群
 */
export const Result = {
  /**
   * 成功した Result を生成する
   */
  ok: <T>(value: T): Result<T, never> => ({
    success: true,
    value,
  }),

  /**
   * 失敗した Result を生成する
   */
  err: <E>(error: E): Result<never, E> => ({
    success: false,
    error,
  }),
};
