# 購入集約仕様書 (Purchase Aggregate Specification)

- **カテゴリ**: ドメインモデル仕様 (`docs/02-domain-models/`)
- **集約名**: 購入集約 (`Purchase`)
- **集約ルート**: `Purchase` Entity

---

## 1. 集約の概要と責務

購入集約は、AI-Note Market における「記事の購入取引の成立と、取引時点の記録（領収書・閲覧アクセス権の根拠）」を管理する集約である。
一度成立した購入取引は原則として不変（Immutable）であり、記事の価格改定や販売停止などの後発イベントから完全に独立した取引証跡を保持する。

---

## 2. 構成する部品（Value Objects / 識別子）

| 部品名 | 型 / 構造 | ビジネスルール・不変条件 | 関連エラーコード |
| :--- | :--- | :--- | :--- |
| **`PurchaseId`** | `string` (UUID) | 購入記録の一意な識別子。`crypto.randomUUID()` で自動採番。 | - |
| **`NoteId`** | `string` (UUID) | 購入対象となった記事の識別子。 | - |
| **`BuyerId`** | `string` (UUID) | 記事を購入したユーザーの識別子。 | - |
| **`purchasedPrice`** | `Price` (VO) | **購入成立時点の価格スナップショット**。<br>取引成立時の記事価格を固定コピーして保持する。 | - |
| **`purchasedAt`** | `Date` | 取引成立日時。 | - |

---

## 3. 集約ルート (`Purchase` Entity) の振る舞い・不変条件

### ① 購入取引の成立 (`Purchase.create`)
- **引数**: `note: Note`, `buyerId: BuyerId`, `purchasedAt?: Date`
- **戻り値**: `Result<Purchase, DomainError>`
- **検証ルール（不変条件）**:
  1. **自己購入の禁止**: 著者は自分自身の記事を購入できない（`buyerId.equals(note.authorId)` の場合はエラー）。
  2. **販売状態の検証**: 記事が購入可能な状態であること（`note.isPurchasable()` が `false` の場合はエラー）。
  3. **スナップショットの固定**: `purchasedPrice` に `note.price` の値をそのままコピーして格納する。

---

## 4. なぜ Note 集約と Purchase 集約を分離するのか？（設計判断）

1. **パフォーマンスとデータ肥大化の防止**:
   - 記事（`Note`）の中に購入者リストを持たせると、数千〜数万件売れた人気記事を読み込むたびにメモリ・DB負荷が爆発する。
   - `Note` と `Purchase` を分離することで、記事閲覧時は `Note` 1レコードのみを高速に読み込める。
2. **同時購入のロック競合防止**:
   - 複数人が同時に「購入」ボタンを押した際、`Note` テーブルを更新（ロック）する必要がなく、`Purchase` テーブルに新規レコードを独立して `INSERT` できるため、高い並行処理性能を実現できる。
3. **価格スナップショットの保証**:
   - `Purchase` が自身の `purchasedPrice` を保持することで、著者が後から記事の価格を変更しても、過去の購入履歴・売上データが改ざんされる事故を構造的に防止する。

---

## 5. ドメインエラー一覧

| エラーコード | 概要・発生契機 |
| :--- | :--- |
| `CANNOT_PURCHASE_OWN_NOTE` | 著者が自分自身の記事を購入しようとした |
| `NOTE_NOT_FOR_SALE` | 下書き（DRAFT）または販売停止（ARCHIVED）の記事を購入しようとした |
| `ALREADY_PURCHASED_NOTE` | （UseCase層にて検証）同一ユーザーが既に購入済みの記事を重複購入しようとした |
