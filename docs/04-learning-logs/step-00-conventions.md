# 学習ログ Step 00: 命名規則と基本概念（Entity vs Value Object）

- **日付**: 2026-08-23
- **テーマ**: 設計思想における命名規則と、Entity / Value Object の見分け方

---

## 1. 命名規則のまとめ

| 役割 | 命名ルール | 具体例 | 理由・目的 |
| :--- | :--- | :--- | :--- |
| **Value Object** | 名詞 (PascalCase) | `Price`, `NoteTitle`, `EmailAddress` | 「値そのもの」を表す |
| **Entity** | 名詞 (PascalCase) | `Note`, `User`, `Purchase` | 「背番号（ID）を持つ固有のモノ」を表す |
| **UseCase** | 動詞 + 名詞 + `UseCase` | `PublishNoteUseCase`, `RegisterFavoriteNoteUseCase` | 「システムで行う手順・アクション」を表す |
| **Repository Interface** | `I` + 名詞 + `Repository` | `INoteRepository` | 「データの保存・取得の約束事」を表す |
| **Repository 具象** | 実装方式 + 名詞 + `Repository` | `InMemoryNoteRepository`, `PrismaNoteRepository` | 「具体的な保存の仕組み」を表す |

---

## 2. Entity と Value Object の見分け方

- **Entity（エンティティ）**:
  - **背番号（ID）** を持ち、状態が変わっても同じ個体として追跡される（例: ユーザー、記事）。
  - 例: 記事のタイトルや価格が変わっても、記事IDが同じなら「同じ記事」として扱われる。
- **Value Object（値オブジェクト）**:
  - IDを持たず、**「値そのもの」** が同じであれば同一とみなせる（例: 価格、メールアドレス、年齢）。
  - 原則として**不変（Immutable）** であり、変更時は新しい値オブジェクトを生成して差し替える。

---

## 3. 次回へのステップ

- **Step 01**: 最小の Value Object である `Price`（価格ルール: 無料0円 または 100円〜50,000円）を TypeScript クラスとして実装し、Vitest で単体テストを動かしてみる。
