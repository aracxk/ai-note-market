# 学習ロードマップ (Learning Roadmap)

本書は、「AI × note アイディア販売所（AI-Note Market）」の開発を通じて設計思想を段階的に学ぶための全体ロードマップです。

```mermaid
flowchart TD
    Phase0["Phase 0: 環境整備 & agent.md & docs体系化 (完了)"]
    Phase1["Phase 1: DDD (中身を作る) - Value Object / Entity / 単体テスト (完了)"]
    Phase2["Phase 2: Feature-based Clean Architecture - UseCase / Repository / DIP"]
    Phase3["Phase 3: Zod & スキーマ駆動 - 境界防御 / Input DTO / Result型"]
    Phase4["Phase 4: CQRS & 読み取りモデル - 一覧・検索の最適化とデータ結合"]
    Phase5["Phase 5: Next.js UI連携 - Server Actions & クリーンUI"]
    Phase6["Phase 6: Playwright E2Eテスト & CI自動化"]
    Phase7["Phase 7: Go言語での再実装比較 (発展)"]

    Phase0 --> Phase1 --> Phase2 --> Phase3 --> Phase4 --> Phase5 --> Phase6 --> Phase7
```

---

## 各フェーズの詳細ゴール

### Phase 0: 環境整備 & AI制御 (完了)
- [x] ワークスペース準備 (`ai-note-market`)
- [x] AI行動制御ルール (`agent.md`)
- [x] ドキュメント階層構造 (`docs/`)
- [x] TypeScript / Vitest の基本環境セットアップ
- [x] Git管理・GitHub連携・PRテンプレート整備・レビューSkill配備

### Phase 1: 【ステップ1】DDD（中身を作る） (完了)
- **ゴール**: 外部フレームワークに一切依存しない純粋なドメイン層を実装し、ビジネスルールを強固にカプセル化する。
- **実装内容**:
  - [x] 共通基盤: `Result` 型, `DomainError` 基底クラス, `ValueObject` / `Entity` 基底クラス
  - [x] `UserId` & `NoteId` & `PurchaseId`（識別子）＋ 単体テスト (15 passed)
  - [x] `Price` Value Object（無料0円、有料100円〜100,000円、Flyweight最適化）＋ 単体テスト (11 passed)
  - [x] `NoteTitle` Value Object（5〜100文字、トリム処理）＋ 単体テスト (9 passed)
  - [x] `Category` Value Object（大カテゴリ×小カテゴリの整合性、Flyweight最適化）＋ 単体テスト (10 passed)
  - [x] `NoteContent` Value Object（本文：無料10〜10,000文字 / 有料1〜50,000文字）＋ 単体テスト (15 passed)
  - [x] `Note` Entity / Aggregate（状態遷移：Draft → Published → Archived、閲覧認可）＋ 単体テスト (15 passed)
  - [x] `Purchase` Entity / Aggregate（自己購入禁止、販売状態検証、価格スナップショット）＋ 単体テスト (6 passed)
- **テスト**: Vitest による純粋なドメイン単体テスト (全85件 All Green, 32ms)

### Phase 2: 【ステップ2】Feature-based Clean Architecture（器で包む）
- **ゴール**: 各フィーチャー内でドメインを呼び出す手順（UseCase）と永続化の約束事（Repository）を定義し、依存性の逆転（DIP）を体感する。
- **実装内容**:
  - **記事機能 (`src/features/note/`)**:
    - `INoteRepository`（インターフェース）
    - `PublishNoteUseCase`（記事公開ユースケース）
    - `InMemoryNoteRepository`（テスト用インフラ具象）
    - ユースケース単体テスト
  - **購入機能 (`src/features/purchase/`)**:
    - `IPurchaseRepository`（インターフェース）
    - `PurchaseNoteUseCase`（記事購入ユースケース：二重購入防止・自己購入禁止・保存）
    - `InMemoryPurchaseRepository`（テスト用インフラ具象）
    - ユースケース単体テスト
- **テスト**: インメモリリポジトリを用いた高速なユースケース単体テスト

### Phase 3: Zod によるスキーマ駆動・境界防御
- **ゴール**: ドメインルールと外部入力バリデーションの責務を綺麗に分離する。
- **実装内容**:
  - APIやフォームからの入力を検証する Zod スキーマ
  - DTO からドメインオブジェクトへの変換と Result 型によるエラーハンドリング

### Phase 4: CQRS による読み取り専用クエリモデルの構築
- **ゴール**: 疎結合にした集約同士の一覧表示（購入履歴、著者別記事一覧等）を、集約を介さず高速に結合取得するクエリサービスを構築する。
- **実装内容**:
  - `PurchaseHistoryQueryService`（マイページ用購入一覧 DTO 取得）
  - `NoteSummaryQueryService`（一覧画面用カード DTO 取得）

### Phase 5: Next.js App Router UI 実装 & Vercel デプロイ
- **ゴール**: Clean Architecture の最外層（Presentation層）として Next.js を接続し、Vercel 上で動作確認を行う（ADR 0002 参照）。
- **実装内容**:
  - 記事一覧・詳細画面（Server Components）
  - 購入ボタンと Server Actions による UseCase 呼び出し
  - 閲覧権限（購入済みか否か）による本文表示制御
  - Vercel への初回デプロイとプレビュー環境の確認

### Phase 6: Playwright による E2E テスト & CI ワークフロー
- **ゴール**: ユーザー視点でのシナリオテスト（執筆 → 公開 → 別ユーザーで購入 → 閲覧可能になる）を自動化し、GitHub Actions で継続的テスト環境を構築する。
- **実装内容**:
  - 主要ユースケースの E2E シナリオテスト実装
  - `.github/workflows/ci.yml` による push/PR 時の自動単体テスト・型チェック・E2E実行ワークフロー構築

### Phase 7 (発展): Go言語での再実装・設計比較
- **ゴール**: 同じドメインルールを Go のインターフェースと構造体で実装し、言語特性による表現の違いを比較。
