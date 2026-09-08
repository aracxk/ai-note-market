# 設計決定記録一覧 (Architecture Decision Records)

- **カテゴリ**: 設計決定記録 (`docs/03-adr/`)
- **目的**: プロジェクトにおける重要なアーキテクチャ・技術選定・ビジネスルールの「決定理由（Why）」と「トレードオフ」を一元管理する。

---

## ADR 一覧

| ID | タイトル | ステータス | 決定日 | 概要 |
| :--- | :--- | :--- | :--- | :--- |
| **[0001](0001-initial-architecture.md)** | 初期アーキテクチャおよび設計方針の採択 | 承認済 (Accepted) | 2026-08-23 | DDD・クリーンアーキテクチャ・フィーチャーベース構造の採択 |
| **[0002](0002-deployment-platform-vercel.md)** | デプロイ基盤としての Vercel 採用および導入計画 | 承認済 (Accepted) | 2026-08-23 | Next.js App Router と Server Actions に最適化された Vercel の採用と Phase 5 での導入計画 |
| **[0003](0003-pricing-policy-and-limits.md)** | 記事価格帯の決定方針（最低100円〜上限10万円および手数料内包モデル） | 承認済 (Accepted) | 2026-08-23 | Stripe決済手数料構造、競合調査、初心者参入容易性と高額AIノウハウ売買の両立に基づく価格帯の決定 |
| **[0004](0004-ubiquitous-language-and-naming-conventions.md)** | ユビキタス言語の洗練（Category への汎用化と UserId への型統合） | 承認済 (Accepted) | 2026-08-23 | 過度な具体化を避ける Category へのリネームと、著者・購入者を UserId 型に統一するモデリング決定 |
| **[0005](0005-category-dimension-redesign.md)** | 記事カテゴリの分類軸再設計（ツール依存から目的領域×成果物形式への普遍化） | 承認済 (Accepted) | 2026-08-23 | ツール名依存を廃止し、目的業務領域（大分類）×成果物形式（小分類）による普遍的カテゴリモデルの採択 |
| **[0006](0006-repository-interface-placement.md)** | Repository インターフェースの配置場所の決定（usecases/ 配下への配置） | 承認済 (Accepted) | 2026-08-23 | domain/ の純粋性維持と Ports & Adapters パターンに基づく usecases/ 配下への配置決定 |
| **[0007](0007-zod-schema-placement-and-boundary-defense.md)** | Zod スキーマの配置場所と境界防御（Boundary Defense）方針の決定 | 承認済 (Accepted) | 2026-09-07 | ドメイン純粋性保護・実行時検証・将来のOpenAPI連携を見据えた schemas/ 独立配置の決定 |

---

## ADR 運用ルール

1. **新規作成時**:
   - `docs/03-adr/XXXX-title.md`（4桁連番）でファイルを作成する。
   - 本一覧（`docs/03-adr/README.md`）にID・タイトル・ステータス・概要を追記する。
2. **ステータス定義**:
   - `提案中 (Proposed)`: 検討中の設計案。
   - `承認済 (Accepted)`: 採択され、実装に反映された設計。
   - `置換済 (Superseded)`: 後のADRによって上書き・破棄された古い決定。
