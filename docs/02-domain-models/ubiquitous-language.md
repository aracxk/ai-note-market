# ユビキタス言語定義書 (Ubiquitous Language)

- **カテゴリ**: ドメインモデル仕様 (`docs/02-domain-models/`)
- **テーマ**: AI-Note Market における公式用語集・命名規則・禁止用語集

---

## 1. ユビキタス言語の原則

1. **会話・設計書・コードの完全一致**:
   - 会話で使う言葉、ドキュメントに書く言葉、ソースコードのクラス名・メソッド名・プロパティ名を1文字のブレもなく一致させる。
2. **コンテキストに応じた適切な具体化**:
   - 過度な具体化（例: `AiCategory`）を避け、ドメインの本質を突いた命名（`Category`）を採用する。
3. **型の統一とプロパティ名によるロール表現**:
   - 同一の概念（ユーザーID）は単一の型 `UserId` で表現し、コンテキスト内の役割（著者／購入者）はプロパティ名（`authorId` / `buyerId`）で表現する。

---

## 2. コアドメイン用語集（Entities / Value Objects）

| 日本語（会話） | 英語 / 型名 | 定義・責務 | コード上のプロパティ例 |
| :--- | :--- | :--- | :--- |
| **記事 / ノート** | `Note` | AIノウハウ・プロンプト・Skillsを販売するコンテンツ本体（集約ルート）。 | `const note: Note` |
| **記事ID** | `NoteId` | 記事の一意な識別子（UUID）。 | `note.id: NoteId` |
| **ユーザーID** | `UserId` | プラットフォーム上のユーザー（著者・購入者）の一意な識別子（UUID）。 | `user.id: UserId` |
| **著者** | `UserId` (型) | 記事を執筆・公開したユーザー。プロパティ名で表現。 | `note.authorId: UserId` |
| **購入者** | `UserId` (型) | 記事を購入したユーザー。プロパティ名で表現。 | `purchase.buyerId: UserId` |
| **記事タイトル** | `NoteTitle` | 5文字以上100文字以内の見出し（前後の空白は自動トリム）。 | `note.title: NoteTitle` |
| **記事本文** | `NoteContent` | 無料エリアと有料エリアをカプセル化した本文オブジェクト。 | `note.content: NoteContent` |
| **無料エリア** | `FreeArea` / `string` | 未購入者を含むすべてのユーザーが閲覧可能な導入・概要（10〜10,000文字）。 | `content.freeArea: string` |
| **有料エリア** | `PaidArea` / `string` | 著者および購入者のみが閲覧可能な具体的なノウハウ本文（1〜50,000文字）。 | `content.paidArea: string` |
| **販売価格** | `Price` | 著者が現在設定している記事の販売金額（0円 または 100〜100,000円）。 | `note.price: Price` |
| **カテゴリ** | `Category` | 大分類（ツール/領域）× 小分類（形式）の組み合わせ。 | `note.category: Category` |
| **大カテゴリ** | `MajorCategory` | 対象AI基盤・ツール（`CLAUDE`, `GEMINI`, `CURSOR`, `CHATGPT`, `OTHER`）。 | `category.major` |
| **小カテゴリ** | `MinorCategory` | アイディアの形式・種別（`SKILLS`, `SPARK`, `CURSOR_RULES`, `GPTS`, `PROMPT`, `OTHER`）。 | `category.minor` |
| **記事ステータス** | `NoteStatus` | `DRAFT`（下書き）、`PUBLISHED`（公開中）、`ARCHIVED`（販売停止）。 | `note.status: NoteStatus` |
| **購入記録** | `Purchase` | 記事の購入取引が完了したことを証明する不変の取引証跡（集約ルート）。 | `const purchase: Purchase` |
| **購入記録ID** | `PurchaseId` | 取引の一意な識別子（UUID）。 | `purchase.id: PurchaseId` |
| **購入時価格** | `Price` (型) | 取引成立瞬間の価格スナップショット（後から価格改定されても不変）。 | `purchase.purchasedPrice: Price` |
| **購入日時** | `Date` | 決済が完了した日時。 | `purchase.purchasedAt: Date` |

---

## 3. ドメインの振る舞い（メソッド名・操作）

| 日本語（ビジネス要求） | コード上のメソッド名 | 戻り値 | 判定・振る舞いルール |
| :--- | :--- | :--- | :--- |
| **購入可能か？** | `note.isPurchasable()` | `boolean` | `status === PUBLISHED` の場合のみ `true` |
| **有料エリアを読めるか？** | `note.canReadPaidArea(userId, hasPurchased)` | `boolean` | 無料記事なら公開時誰でも可。有料記事は著者本人または購入済みで `true` |
| **記事を公開する** | `note.publish()` | `Result<void, DomainError>` | 必須項目（タイトル・本文・カテゴリ）の不備がなければ `PUBLISHED` に遷移 |
| **販売を停止する** | `note.archive()` | `Result<void, DomainError>` | 著者の操作により `ARCHIVED` に遷移（既存購入者の閲覧権は維持） |
| **価格を改定する** | `note.updatePrice(newPrice)` | `Result<void, DomainError>` | 販売価格を更新（過去の購入記録には影響しない） |

---

## 4. 禁止用語集（アンチパターン・使用してはならない言葉）

用語のブレや認識齟齬を防ぐため、以下の言葉はコードおよび会話で使用してはならない。

| 禁止用語 (❌) | 推奨用語 (⭕) | 禁止の理由 |
| :--- | :--- | :--- |
| `Article`, `Post`, `Item` | `Note` | プラットフォーム全体で「記事」は `Note` に統一する。 |
| `AuthorId` (型), `BuyerId` (型) | `UserId` (型) | 著者も購入者も同一のユーザーであるため、型は `UserId` に一元化し、プロパティ名で区別する。 |
| `AiCategory` | `Category` | 過度な具体化を避け、将来の技術領域拡大に耐えうる汎用的な命名とする。 |
| `Amount` (型) | `Price` | 単なる数値ではなく、無料ルールや範囲制限を持つビジネス概念として `Price` を使う。 |
| `Buy`, `Order` | `Purchase` | 取引証跡の集約名は `Purchase` で統一する。 |
