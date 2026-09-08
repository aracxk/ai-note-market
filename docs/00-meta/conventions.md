# コーディング・設計規約 (Conventions)

本ドキュメントは、プロジェクト全体で一貫した設計・命名・構造を保つための規約です。

---

## 1. 命名規則

| 種類 | 規約 | 例 | 備考 |
| :--- | :--- | :--- | :--- |
| **Value Object** | PascalCase | `Price`, `NoteTitle`, `Category`, `UserId` | 原則イミュータブル（イミュータブルな値） |
| **Entity / 集約** | PascalCase | `Note`, `Purchase`, `User` | 一意なIDを持ち、ライフサイクルを持つ |
| **UseCase** | 動詞 + 名詞 + `UseCase` | `PublishNoteUseCase`, `PurchaseNoteUseCase` | 1つのユースケースにつき1クラス/関数 |
| **Repository Interface** | `I` + 名詞 + `Repository` | `INoteRepository`, `IPurchaseRepository` | UseCase層（`usecases/` 配下）で定義（ポート） |
| **Repository 具象** | 実装方式 + 名詞 + `Repository` | `InMemoryNoteRepository`, `PrismaNoteRepository` | インフラ層で実装 |
| **DTO / Input** | 名詞 + `Input` / `DTO` | `CreateNoteInput`, `NoteResponseDTO` | レイヤー間のデータ受け渡し |

### ドメインモデルの配置と見分け方（集約ルート原則）
- **フォルダ名 ＝ 代表エンティティ（集約ルート）**:
  - `features/<feature_name>/domain/` 配下において、**フォルダ名と一致する単数形大文字ファイル（例: `note/` なら `Note.ts`、`purchase/` なら `Purchase.ts`）が集約の代表エンティティ（Entity）** である。
- **それ以外のファイル ＝ 部品（Value Object）**:
  - `domain/` 内に並ぶそれ以外のファイル（`*Id.ts`, `Price.ts`, `*Title.ts` 等）は、すべて代表エンティティを構成する部品（Value Object）である。
- **フラット配置の根拠**:
  - 不要なサブフォルダ（`entities/`, `value-objects/`）の乱立を防ぐ代わりに、この命名原則によってファイルの役割を一目で判別可能とする。

---

## 2. アーキテクチャの依存方向（最重要ルール）

```text
[ Presentation (Next.js / UI / API) ]
               │ (依存)
               ▼
[ UseCases (Application) ]
       │                │ (依存)
       │ (依存)          ▼
       │         [ Domain (Entity, VO, Repository I/F) ]
       ▼                        ▲
[ Infrastructure ] ─────────────┘ (DIP: 依存性の逆転)
```

- **Domain層**: 何にも依存しない（純粋な TypeScript）。フレームワークやライブラリの import は禁止。
- **UseCase層**: Domain層にのみ依存する。DBや外部APIの具象には依存せず、Repository Interface を通じて操作する。
- **Infrastructure層**: Domain層で定義された Interface を実装する（DB接続、ファイル保存など）。
- **Presentation層**: UseCase を呼び出し、UIやAPIレスポンスを生成する。

---

## 3. エラーハンドリング方針

- **ドメイン例外（Domain Rule Violation）**: 不正な値の生成や無効な状態遷移は、専用のドメイン例外（または `Result.err()`）で早期に防ぐ（Fail-Fast）。
- **外部入力エラー**: UI/API 境界で Zod を用いて弾き、ドメイン層には「型安全で正しい値」のみを渡す。

---

## 4. ドキュメント執筆規約

- **絵文字の不使用**:
  - ドキュメント、ソースコード内のコメント、コミットメッセージ等において絵文字は使用せず、平易で明瞭なテキストを用いる。
- **構造化とフォルダ分類**:
  - ドキュメントは必ず `docs/` 配下の適切なカテゴリ（`00-meta`, `01-architecture`, `02-domain-models`, `03-adr`, `04-learning-logs`）に配置する。
- **設計判断（ADR）の記録**:
  - 技術選定や大きな設計方針の決定時は、`docs/03-adr/` にコンテキストとトレードオフを記録する。

---

## 5. Git・コミット・PR運用規約

### コミットメッセージの形式
コミットメッセージはすべて**日本語**で記述し、以下のプレフィックスを使用する。

`プレフィックス: 日本語の説明`

| プレフィックス | 用途 | 例 |
| :--- | :--- | :--- |
| **`feat`** | 新機能・ドメインモデルの実装 | `feat: 記事タイトル（NoteTitle）の値オブジェクトを実装` |
| **`fix`** | バグ修正 | `fix: 価格バリデーションの境界値判定を修正` |
| **`docs`** | ドキュメントの追加・更新 | `docs: テスト設計戦略のドキュメントを追加` |
| **`test`** | テストコードの追加・修正 | `test: Price の境界値テストケースを追加` |
| **`refactor`** | 振る舞いを変えないコードの改善 | `refactor: Result 型のヘルパー関数を整理` |
| **`chore`** | 環境設定、ビルド構成の変更 | `chore: .gitignore にカバレッジフォルダを追加` |

### Pull Request (PR) 運用規約
- **Phase 1（基盤構築期）**: `main` 直コミットにて迅速にドメイン基盤を整備（完了）。
- **Phase 2（Clean Architecture）以降**:
  - すべての実装は `feature/機能名` ブランチを切って作業を行い、PR（ドラフト含む）を作成する。
  - 実装完了後、専用スキル（`.agents/skills/strict-code-review/`）によるレビューを実行する。
  - レビュー結果をチャット上でユーザーに提示し、「この内容で PR にコメント投稿してよろしいでしょうか？」と承認を得てから PR へレビューを投稿する。
  - 15項目チェックリストを満たし、最終承認を得てから `main` へマージする。

---

## 6. ID・日時の設計方針

### ID（識別子）の型安全化
- 単なる `string` ではなく、`NoteId`, `UserId` などの専用 Value Object として定義する。
- 異なるID同士の誤代入（引数の取り違え）をコンパイルレベルで防止する。
- IDの自動生成には標準の `crypto.randomUUID()` を使用する。

### 日時（CreatedAt / PurchasedAt 等）の扱い
- ドメインオブジェクト生成時、デフォルト引数やファクトリメソッド経由で `Date` を外部から注入可能にする。
- テスト実行時に過去・未来の任意の日時を渡せるようにし、日時に依存するテストの再現性を保証する。

---

## 7. 値オブジェクトのメモリ最適化規約（Flyweightパターン）

- **静的ファクトリメソッドの必須化**:
  - すべての値オブジェクトはコンストラクタを `private` にし、`create()` などの静的ファクトリメソッド経由でのみ生成可能とする。
- **頻出値・デフォルト値のキャッシュ**:
  - `Price.free()`（0円）や `NoteStatus.DRAFT` など、システム内で大量に利用される固定値・デフォルト値は、事前に1つだけ生成して使い回す（Flyweightパターン）設計を常に検討・適用する。
- **テストでの証明義務**:
  - キャッシュを適用した値オブジェクトには、`expect(a).toBe(b)` による参照一致（同一インスタンス返却）テストを必ず作成する。
  - 詳細な設計思想は `docs/01-architecture/07-value-object-optimization.md` を参照のこと。

---

## 8. ドキュメントとコードの完全同期・横断Grep検証規約

- **静的テキストの完全一致義務**:
  - ソースコード内の定数やビジネスルールを変更した際は、JSDoc、インラインコメント、単体テスト、`docs/` 配下の仕様書すべてを `grep` 検索し、古い数値や説明が1文字たりとも残っていないことを機械的に確認しなければならない。
  - 「テストが通ったから完了」とするのではなく、ドキュメント・コメントとの完全同期をもって完了と定義する。

---

## 9. ADR（設計決定記録）起票とWhyの記録規約

- **決定理由の永続化**:
  - 価格帯の改定、アーキテクチャ選定、外部サービス採用、手数料モデルなど、重大な意思決定（Why）を行った際は、コード実装前に必ず `docs/03-adr/` に起票する。
  - AIおよび開発者は、議論の着地時点で自発的に ADR 起票を提案しなければならない（受動的な指示待ちの禁止）。

---

## 10. 学習ログ（04-learning-logs/）の運用規約

- **仕様の重複禁止（DRY原則）**:
  - 単なるクラスのプロパティやエラーコードの羅列など、`docs/02-domain-models/`（仕様書）やテストコードに書かれている内容を学習ログに再掲・複製してはならない。
- **記録対象の限定（節目・新概念に特化）**:
  - 学習ログは「新しい設計概念（Result型、Flyweight最適化、集約の境界、DIPなど）」を学んだ際や、「フェーズ完了時の総括」など、深いディスカッションや気づき（Q&A）が発生した節目にのみ作成する。単なる定型実装の作業記録は作成しない。

---

## 11. 基底クラス設計規約（薄い Entity と ValueObject の原則）

- **過剰な共通化の禁止（Fat Base Class の防止）**:
  - `Entity<ID>` および `ValueObject` 基底クラスには、DB保存やJSONシリアライズ等の余計な便利メソッドを持たせてはならない。
- **最小限の契約（Contract）の徹底**:
  - `ValueObject`: `abstract equals(other: this): boolean` のみを義務付ける。
  - `Entity<ID>`: `protected readonly _id: ID` を保持し、`id` ゲッターおよび `equals(other?: Entity<ID>): boolean`（ID一致判定）のみを提供する。
- **継承による判別性の向上**:
  - すべての値オブジェクトは `extends ValueObject` を、すべてのエンティティは `extends Entity<ID>` を継承し、コードの1行目でクラスの性質を一目で判別可能とする。

---

## 12. Zod スキーマ設計・実装規約（境界防御ルール）

外部から受け取る生データ（HTTPリクエスト、フォーム入力）を安全に検証し、開発者ごとの実装のブレを防ぐための統一ルール。

### ① 配置場所の原則
- 各フィーチャー直下の `src/features/<feature>/schemas/` に配置する（ADR 0007 準拠）。
- ドメイン層（`src/**/domain/`）には、いかなる場合も `zod` を import してはならない。

### ② 文字列の空白トリム（.trim()）の必須化
- ユーザー入力の文字列フィールドは、原則として `.trim()` をチェーンし、前後の不要な空白を自動除去した上で文字数チェックを行う。
- 空白のみの入力（`"   "`）による文字数チェックのすり抜けを防止する。

### ③ ビジネスルール数値のドメイン定数参照義務
- 文字数の下限・上限や価格の範囲など、ビジネスルールに関わる数値のベタ書き（ハードコード）を禁止する。
- 必ずドメイン層で公開されている定数（例: `NoteTitle.MIN_LENGTH`, `Price.MIN_AMOUNT` 等）を import して参照し、ルール変更時の二重管理と修正漏れを撲滅する。

### ④ 相関バリデーションにおける .superRefine() の使用
- 「価格が有料なら本文必須」のように複数フィールドが連動する検証には、`.refine()` ではなく `.superRefine((data, ctx) => ...)` を使用する。
- エラー発生時は `ctx.addIssue({ path: ["fieldName"], message: "..." })` を用い、UI側でどの入力欄がエラーであるかを特定可能にする。

### ⑤ 型の自動導出（z.infer）
- Input DTO 型は手動で `interface` を書かず、必ず `export type XxxInput = z.infer<typeof xxxSchema>;` でスキーマから自動導出する。

### ⑥ Result 型への変換による例外（throw）撲滅
- 外部生データの検証には `validateSchema(schema, rawData)` 共通ユーティリティを使用し、検証失敗時も例外を投げずに `Result.err(SchemaValidationError)` で安全に処理する。

