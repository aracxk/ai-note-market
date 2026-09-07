# 学習振り返りログ: Step 03 Zod によるスキーマ駆動と境界防御 (Boundary Defense)

- **カテゴリ**: 学習ログ (`docs/04-learning-logs/`)
- **日付**: 2026-09-07
- **テーマ**: 実行時バリデーションとコンパイル時型の自動導出、ドメイン層との「二重防御」の住み分け、Single Source of Truth と将来の OpenAPI / Swagger 連携

---

## 1. 今回学んだ設計の核心 (Core Insights)

### ① なぜドメイン層があるのに Zod が必要なのか？（二重防御の住み分け）
- **ドメイン層（最後の砦）**:
  - `NoteTitle` や `Price` のバリデーションは、ビジネスルールの整合性を保証する「最後の砦」。
  - 外部ライブラリ（Zod 等）への依存を一切持たず、純粋な TypeScript としてドメイン知識をカプセル化する。
- **Zod スキーマ層（城門のフィルター / 境界防御）**:
  - ブラウザのフォームや API から送られてくるデータは、型安全性のない未知のデータ（`unknown` / 泥水）。
  - TypeScript の `interface` は実行時に消滅するため、実行時にも動く Zod で型不一致や必須漏れを城門の前で門前払いする。
  - 画面の入力フィールドごとに親切なエラーメッセージ（「タイトルは5文字以上で入力してください」など）を整形して返す。

### ② スキーマ駆動（Schema-Driven）と Single Source of Truth
- `z.object({...})` でデータの設計図（スキーマ）を 1 箇所定義するだけで、以下の 3 つが自動的に連動する。
  1. **実行時バリデーション**: `schema.safeParse(data)` による安全な検証。
  2. **TypeScript の型定義**: `export type Input = z.infer<typeof schema>;` による自動型導出（手動での interface 作成を廃止し、二重メンテを根絶）。
  3. **将来の OpenAPI / Swagger 連携**: `@asteasolutions/zod-to-openapi` 等を用いることで、追加の YAML 手書きなしで API ドキュメントを自動生成可能。

### ③ Result 型との融合（validateSchema ユーティリティ）
- Zod の標準エラー（`ZodError`）は構造が複雑で画面で扱いにくいため、共通関数 `validateSchema` を通してプロジェクト標準の `Result<T, SchemaValidationError>` に変換。
- 成功時は `Result.ok(cleanData)`、失敗時は `Result.err(error)` を返すことで、例外（`throw`）を発生させない安全な制御フローを貫徹した。

---

## 2. 関連ドキュメント
- [ADR 0007: Zod スキーマの配置場所と境界防御方針の決定](../03-adr/0007-zod-schema-placement-and-boundary-defense.md)
- [ADR 0006: Repository インターフェースの配置場所の決定](../03-adr/0006-repository-interface-placement.md)
