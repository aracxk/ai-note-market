# 記事集約仕様書 (Note Aggregate Specification)

- **カテゴリ**: ドメインモデル仕様 (`docs/02-domain-models/`)
- **集約名**: 記事集約 (`Note`)
- **集約ルート**: `Note` Entity

---

## 1. 集約の概要と責務

記事集約は、AI-Note Market における「記事の執筆・編集・公開・販売停止・価格改定・本文閲覧権限判定」を統括する集約である。
記事に関するすべての不変条件（ビジネスルール）を保護し、無効な状態（タイトル不備のまま公開される、不正な価格が設定される等）への遷移をコンパイルおよび実行時に完全に防止する。

---

## 2. 構成する部品（Value Objects / 識別子）

| 部品名 | 型 / 構造 | ビジネスルール・不変条件 | 関連エラーコード |
| :--- | :--- | :--- | :--- |
| **`NoteId`** | `string` (UUID) | 記事の一意な識別子。`crypto.randomUUID()` で自動採番。 | - |
| **`AuthorId`** | `string` (UUID) | 記事を執筆した著者のユーザー識別子。 | - |
| **`NoteTitle`** | `string` | ・5文字以上100文字以内<br>・前後の空白は自動トリム（`trim()`）<br>・空白のみは不可 | `INVALID_NOTE_TITLE_LENGTH` |
| **`NoteContent`** | `{ freeArea, paidArea }` | ・`freeArea`（無料エリア）: 必須（10〜10,000文字）<br>・`paidArea`（有料エリア）: 有料記事は必須（1〜50,000文字）、無料記事は空文字許容 | `INVALID_FREE_AREA_LENGTH`<br>`PAID_AREA_REQUIRED_FOR_PAID_NOTE` |
| **`Price`** | `number` | ・0円（無料）または 100円〜50,000円（有料）<br>・整数のみ許容（小数は不可） | `INVALID_PRICE_RANGE` |
| **`AiCategory`** | `{ major, minor }` | ・大カテゴリと小カテゴリの組み合わせが定義済みリストに合致すること | `INVALID_AI_CATEGORY_COMBINATION` |
| **`NoteStatus`** | Enum (`DRAFT`, `PUBLISHED`, `ARCHIVED`) | ・状態の表現。直接の外部変更は不可（メソッド経由でのみ遷移） | `INVALID_NOTE_STATUS_TRANSITION` |

---

## 3. 集約ルート (`Note` Entity) の振る舞い・メソッド

### ① 下書き作成 (`Note.createDraft`)
- **引数**: `id`, `authorId`, `title`, `content`, `price`, `aiCategory`, `createdAt?`
- **振る舞い**: 初期状態を `NoteStatus.DRAFT` としてインスタンスを生成する。

### ② 記事公開 (`note.publish()`)
- **条件**:
  - タイトル、本文、価格、AIカテゴリがすべて正常に設定されていること。
  - すでに `PUBLISHED` の場合はエラー（または冪等に成功）。
- **振る舞い**: ステータスを `PUBLISHED` に変更し、`updatedAt` を更新する。

### ③ 販売停止 (`note.archive()`)
- **条件**: 著者の指示により、いつでも実行可能。
- **振る舞い**: ステータスを `ARCHIVED` に変更する。新規購入（`isPurchasable`）は不可となるが、既存購入者の閲覧権限は維持される。

### ④ 価格改定 (`note.updatePrice(newPrice)`)
- **条件**: 新しい `Price` が有効であること。
- **振る舞い**: 記事の現在販売価格を更新する（過去の購入者の購入記録には影響しない）。

### ⑤ 新規購入可否判定 (`note.isPurchasable()`)
- **戻り値**: `boolean`
- **判定ルール**: `status === NoteStatus.PUBLISHED` の場合のみ `true`。

### ⑥ 有料エリア閲覧認可 (`note.canReadPaidArea(userId, hasPurchased)`)
- **戻り値**: `boolean`
- **判定ルール**:
  1. 無料記事（`price.isFree()`）の場合: 記事が `PUBLISHED` ならば誰でも `true`。
  2. 有料記事の場合:
     - 著者本人（`userId === this.authorId`）である場合 ➔ `true`
     - 購入履歴が存在する（`hasPurchased === true`）場合 ➔ `true`（記事が `ARCHIVED` でも閲覧可）
     - それ以外 ➔ `false`

---

## 4. ドメインエラー一覧

| エラーコード | 概要・発生契機 |
| :--- | :--- |
| `INVALID_NOTE_TITLE_LENGTH` | タイトルが5文字未満または100文字超過 |
| `INVALID_FREE_AREA_LENGTH` | 無料エリア本文が10文字未満または10,000文字超過 |
| `PAID_AREA_REQUIRED_FOR_PAID_NOTE` | 有料記事（価格>0）なのに有料エリア本文が未設定 |
| `INVALID_PRICE_RANGE` | 価格が0円以外で100円未満または50,000円超過、または小数 |
| `INVALID_AI_CATEGORY_COMBINATION` | 大カテゴリと小カテゴリの組み合わせが不整合 |
| `INVALID_NOTE_STATUS_TRANSITION` | 不正な状態遷移（例: 必須項目不備のまま公開しようとした等） |
