# ADR 0010: 技術的命名規則（Technical Naming Conventions）の策定

- **ステータス**: 承認済 (Accepted)
- **日付**: 2026-09-13
- **意思決定者**: ユーザー & Antigravity (AI)

---

## 1. コンテキスト（背景と課題）
ドメイン用語（ビジネス用語）については `ubiquitous-language.md` にて厳格に定義されているが、React・TypeScript・DDDといった「技術的な構造（アーキテクチャ）」に対する命名規則が明文化されていなかった。
チーム開発およびAI駆動開発において、「型名に \`Type\` を付けるべきか」「ファイル名は大文字か小文字か」といった無駄な議論（Bikeshedding）や一貫性の欠如を防ぐため、現在のコードベースで暗黙的に採用されているモダンなベストプラクティスを公式ルールとして明文化する。

## 2. 決定事項 (Decision)

現在のプロジェクトは、「TypeScript / React コミュニティの標準」と「クリーンアーキテクチャ（C#/Java由来）の標準」のハイブリッド仕様に沿って実装されており、今後も以下の規則を遵守する。

### 2.1 型（Type / Interface）の命名とサフィックス
型名に `Type` や `Interface` というプログラミング用語（冗長表現）を付けることを禁止し、「アーキテクチャ上の役割」をサフィックスとして付与する。

| 役割 | 命名規則 (PascalCase) | 例 |
| :--- | :--- | :--- |
| **ドメイン（Entity/VO）** | サフィックスなし | `Note`, `UserId`, `Price` |
| **Reactコンポーネント引数** | `[ComponentName]Props` | `PurchaseButtonProps`, `NoteCardProps` |
| **RHF(フォーム)データ** | `[Action]FormData` | `PurchaseFormData`, `RegisterFormData` |
| **境界越えデータ (Read層)** | `[Entity]Dto` | `NoteSummaryDto`, `UserDetailDto` |
| **Zodスキーマ入力型** | `[SchemaName]Input` | `PurchaseNoteSchemaInput` |
| **抽象インターフェース** | `I` プレフィックス | `INoteRepository`, `INoteSummaryQueryService` |

※ `I` プレフィックスはフロントエンド（React界隈）では避ける傾向にあるが、本プロジェクトでは堅牢なDDDバックエンド（依存性逆転原則）を採用しているため、実装クラス（`InMemory~`）と抽象を明確に区別する目的で例外的に採用している。

### 2.2 変数・関数・定数の命名
| 対象 | 命名規則 | 例 |
| :--- | :--- | :--- |
| **React Hooks** | `use` + PascalCase | `usePurchaseNote`, `useMobile` |
| **Zodスキーマ定数** | camelCase + `Schema` | `purchaseFormSchema`, `noteSchema` |
| **Server Actions** | camelCase + `Action` | `purchaseNoteAction`, `publishNoteAction` |
| **真偽値 (boolean)** | `is`, `has`, `can`, `should` | `isPending`, `hasPurchased`, `canRead` |

### 2.3 ファイル名の命名規則
OSによる大文字・小文字の解決トラブルを防ぎ、ファイルの役割を一目で判別可能にする。

| 対象 | 命名規則 | 例 |
| :--- | :--- | :--- |
| **Reactコンポーネント (.tsx)** | PascalCase | `PurchaseButton.tsx`, `AppShell.tsx` |
| **クラス定義 (.ts)** | PascalCase | `InMemoryNoteRepository.ts` |
| **Hooks / 関数 / 定数 (.ts)** | camelCase | `usePurchaseNote.ts`, `purchaseNoteAction.ts` |
| **Next.js 特殊ファイル** | 全て小文字 | `page.tsx`, `layout.tsx` |

---

## 3. 結果・影響 (Consequences)
- 命名に関する迷いがなくなり、レビュー時およびAI生成時のブレが完全に排除される。
- UIコンポーネント（PascalCase）と単なるロジックファイル（camelCase）がファイルツリー上で視覚的に判別しやすくなる。
