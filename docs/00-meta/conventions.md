# コーディング・設計規約 (Conventions)

本ドキュメントは、プロジェクト全体で一貫した設計・命名・構造を保つための規約です。

---

## 1. 命名規則

| 種類 | 規約 | 例 | 備考 |
| :--- | :--- | :--- | :--- |
| **Value Object** | PascalCase | `Price`, `NoteTitle`, `AiCategory` | 原則イミュータブル（イミュータブルな値） |
| **Entity / 集約** | PascalCase | `Note`, `Purchase`, `User` | 一意なIDを持ち、ライフサイクルを持つ |
| **UseCase** | 動詞 + 名詞 + `UseCase` | `PublishNoteUseCase`, `PurchaseNoteUseCase` | 1つのユースケースにつき1クラス/関数 |
| **Repository Interface** | `I` + 名詞 + `Repository` | `INoteRepository`, `IPurchaseRepository` | ドメイン層またはUseCase層で定義 |
| **Repository 具象** | 実装方式 + 名詞 + `Repository` | `InMemoryNoteRepository`, `PrismaNoteRepository` | インフラ層で実装 |
| **DTO / Input** | 名詞 + `Input` / `DTO` | `CreateNoteInput`, `NoteResponseDTO` | レイヤー間のデータ受け渡し |

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

### Pull Request (PR) 運用
- 学習の進行中は `main` ブランチに直接ステップ単位でコミット・プッシュし、一定の大きなマイルストーン（フェーズ完了時等）でPRを作成・記録する。

---

## 6. ID・日時の設計方針

### ID（識別子）の型安全化
- 単なる `string` ではなく、`NoteId`, `UserId` などの専用 Value Object として定義する。
- 異なるID同士の誤代入（引数の取り違え）をコンパイルレベルで防止する。
- IDの自動生成には標準の `crypto.randomUUID()` を使用する。

### 日時（CreatedAt / PurchasedAt 等）の扱い
- ドメインオブジェクト生成時、デフォルト引数やファクトリメソッド経由で `Date` を外部から注入可能にする。
- テスト実行時に過去・未来の任意の日時を渡せるようにし、日時に依存するテストの再現性を保証する。
