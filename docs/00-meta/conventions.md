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
