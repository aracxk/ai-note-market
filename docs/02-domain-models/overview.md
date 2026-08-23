# AI-Note Market ドメインモデル概要

本書は、AI活用ノウハウ・プロンプト販売プラットフォーム「AI-Note Market」のドメインモデルとビジネスルール一覧です。

---

## 1. ドメインモデル概念図

```mermaid
classDiagram
    class Note {
        +NoteId id
        +AuthorId authorId
        +NoteTitle title
        +NoteContent content
        +Price price
        +AiCategory aiCategory
        +NoteStatus status
        +publish()
        +archive()
        +updateContent()
        +isPurchasableBy(userId)
    }

    class Price {
        <<Value Object>>
        -number amount
        +isFree() boolean
    }

    class AiCategory {
        <<Value Object>>
        -string type
        +CLAUDE_SKILLS
        +GEMINI_SPARK
        +CHATGPT_PROMPTS
        +CURSOR_RULES
    }

    class NoteStatus {
        <<Value Object / Enum>>
        +DRAFT
        +PUBLISHED
        +ARCHIVED
    }

    class Purchase {
        <<Aggregate Root>>
        +PurchaseId id
        +NoteId noteId
        +BuyerId buyerId
        +Price purchasedPrice
        +Date purchasedAt
    }

    Note "1" o-- "1" Price
    Note "1" o-- "1" AiCategory
    Note "1" o-- "1" NoteStatus
    Purchase "1" --> "1" Note : 参照
```

---

## 2. 不変条件（ビジネスルール）一覧

### 記事（Note）に関するルール
1. **タイトル（NoteTitle）**: 5文字以上100文字以内。空文字・空白のみは不可。
2. **価格（Price）**: 0円（無料）または 100円〜50,000円。負の数や1〜99円は不可。
3. **AIカテゴリ（AiCategory）**: 許可されたカテゴリ（`Claude Skills`, `Gemini`, `ChatGPT`, `Cursor Rules` 等）のみ。
4. **状態遷移ルール**:
   - `DRAFT (下書き)` → `PUBLISHED (公開)` : タイトル・本文・価格・カテゴリがすべて設定されていること。
   - `PUBLISHED (公開)` → `ARCHIVED (販売停止)` : 著者がいつでも実行可能。
   - `ARCHIVED` から再公開する場合は再審査または再検証が必要。
   - `PUBLISHED` 状態の有料記事は、すでに購入者がいる場合、極端な価格変更を制限する（または変更履歴を残す）。

### 購入・アクセス権（Purchase / Access）に関するルール
1. **自己購入の禁止**: 著者は自分自身の記事を購入できない。
2. **二重購入の禁止**: 同一ユーザーが同じ記事を複数回購入することはできない。
3. **アクセス権（本文閲覧権）**:
   - 記事が「無料（0円）」の場合：誰でも閲覧可能。
   - 記事が「有料」の場合：「著者本人」または「購入履歴が存在するユーザー」のみ閲覧可能。
