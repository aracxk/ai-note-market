# エラーハンドリング戦略：DomainError と Result型の設計思想

- **カテゴリ**: アーキテクチャ理論 (`docs/01-architecture/`)
- **テーマ**: DDD・クリーンアーキテクチャにおけるエラーの表現・伝播・型安全性

---

## 1. なぜエラーハンドリングの設計が重要なのか？

一般的なWebアプリケーションでは、エラー処理が `try-catch` の乱用や暗黙の `throw` によって不透明になりがちです。

- **TypeScriptの `throw` の弱点**: 関数の戻り値の型定義にエラー情報が含まれないため、呼び出し側は内部実装を見ない限り「どんな例外が飛んでくるか」を把握できない。
- **結果**: 意図しない未捕捉例外（Unhandled Exception）によるシステムクラッシュや、逆に `catch (e) {}` でエラーが揉み消されるバグが発生する。

---

## 2. 2つの主要アプローチ比較

### アプローチA: 階層化されたドメイン例外 (`DomainError` ＋ `DomainErrorCode` 一元管理)

JavaScript標準の `Error` を継承した基底クラスを用意し、ビジネスルール違反を型として区別する方式。
エラーコードは `DomainErrorCode.ts` で一元管理し、コンパイルレベルで不正なコードの混入を防止する。

```typescript
// 1. エラーコードの一元管理 (src/shared/domain/DomainErrorCode.ts)
export const DOMAIN_ERROR_CODES = {
  INVALID_PRICE_RANGE: "INVALID_PRICE_RANGE",
  INVALID_NOTE_TITLE_LENGTH: "INVALID_NOTE_TITLE_LENGTH",
  // ...
} as const;

export type DomainErrorCode =
  (typeof DOMAIN_ERROR_CODES)[keyof typeof DOMAIN_ERROR_CODES];

// 2. 基底クラス (src/shared/domain/DomainError.ts)
export abstract class DomainError extends Error {
  abstract readonly code: DomainErrorCode; // DomainErrorCode のみを強制
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// 3. 具体的なドメインエラー
export class InvalidPriceError extends DomainError {
  readonly code = DOMAIN_ERROR_CODES.INVALID_PRICE_RANGE;
  constructor(value: number) {
    super(`価格は0円、または100円〜100,000円で指定してください。入力値: ${value}`);
  }
}
```

- **メリット**: JavaScriptの標準的な例外機構に素直に従える。スタックトレースが自動で付与される。
- **デメリット**: 呼び出し側が `try-catch` を忘れてもコンパイルエラーにならない。

---

### アプローチB: 型安全な結果型 (`Result<T, E>`)

Rust言語などの影響を受けた関数型アプローチ。エラーを「例外（事故）」ではなく「戻り値（値）」として返す。

```typescript
// 共通 Result 型
export type Result<T, E> =
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly error: E };

export const Result = {
  ok: <T>(value: T): Result<T, never> => ({ success: true, value }),
  err: <E>(error: E): Result<never, E> => ({ success: false, error }),
};
```

```typescript
// 適用例 (Value Object)
export class Price {
  public static create(value: number): Result<Price, InvalidPriceError> {
    if (value !== 0 && (value < 100 || value > 100000)) {
      return Result.err(new InvalidPriceError(value));
    }
    return Result.ok(new Price(value));
  }
}

// 呼び出し側の安全性
const result = Price.create(-500);
if (!result.success) {
  // result.error に安全にアクセス可能
  console.log(result.error.code);
  return;
}
// ここでは result.value (Price) が型安全に取り出せる
console.log(result.value.amount);
```

- **メリット**:
  - コンパイル時にエラーハンドリングが強制され、処理漏れがゼロになる。
  - 関数のシグネチャを見るだけで「どんな失敗が起きるか」が一目瞭然。
  - 目に見えない処理のジャンプ（ワープ）がなくなり、処理の流れが直線的になる。
- **デメリット**:
  - 成功/失敗の判定コード（ボイラープレート）が各所で増える。
  - 標準ライブラリや外部ライブラリとの連携時にラップが必要。

---

## 3. 本プロジェクトにおけるエラー設計の黄金ルール

| 分類 | 想定シナリオ | 採用する設計 | 理由 |
| :--- | :--- | :--- | :--- |
| **ドメインエラー（想定内）** | 価格が範囲外、残高不足、重複購入、権限不足 | **`Result<T, E>`** | ビジネス上の日常的な失敗であり、型安全に呼び出し側で分岐させるため |
| **システムエラー（想定外）** | DB接続切断、メモリ不足、未実装機能、致命的バグ | **`throw` (Fatal Exception)** | 処理を即座に中断し、最上位で500エラーとしてログ記録・監視通知するため |
