# 学習ログ Step 01: Value Object の実装と単体テスト（Price）

- **日付**: 2026-08-23
- **テーマ**: 最初の Value Object `Price` の実装、TypeScript構文の理解、Vitest 単体テスト

---

## 1. 今回学んだこと・実装したこと

### ① TypeScript のオブジェクト指向・型機能
- **`private constructor`**: 外からの勝手な `new`（不完全なオブジェクト生成）を完全に封鎖する。
- **`private readonly value: number`**: プロパティの短縮定義 ＆ 一度生成したら二度と変更できない不変性（Immutable）の担保。
- **`public static create(...)`**: 正規の門番（ファクトリメソッド）。ここでバリデーションを実施し、正しい値だけをインスタンス化する。
- **`Result<T, E>` 型**:
  - `throw`（例外）を使わず、成功と失敗を戻り値として型安全に表現する。
  - 呼び出し側で `if (result.success)` による自動絞り込み（Type Narrowing）を強制し、エラー処理の抜け漏れを防ぐ。
- **`DomainError` 基底クラス**:
  - `abstract class` と `abstract readonly code` により、子クラスに一意なエラーコードの実装を義務付ける。

### ② `Price` Value Object のビジネスルール
- 0円（無料）または 100円〜50,000円（有料）のみ許可。
- 小数点を含む数値（100.5円など）や負の数は `InvalidPriceError`（コード: `INVALID_PRICE_RANGE`）として弾く。
- 同値性判定メソッド `equals()` を実装（値オブジェクト同士の同一性チェック）。

### ③ Vitest による単体テスト
- `describe`, `it`, `expect` を使った構造化テストの記述。
- 正常系（0円、100円、50,000円、equals判定）と異常系（-100円、50円、50,001円、100.5円）の網羅。
- 外部フレームワークやDBを介さないため、9件のテストがわずか 2ms で超高速実行されることを確認。

---

## 2. コミット履歴
- `feat: add Result type and DomainError base class`
- `feat: implement Price Value Object and unit tests`
- `docs: add README.md and learning log step-01`
