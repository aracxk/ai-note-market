# AI-Note Market (AI × note アイディア販売所)

![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)
![Vitest](https://img.shields.io/badge/Vitest-2.0-green?logo=vitest)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Architecture](https://img.shields.io/badge/Architecture-DDD%20%7C%20Clean%20%7C%20Feature--based-orange)

AI活用ノウハウ・プロンプト・Claude Skills 等の実践的なアイディアを売買するプラットフォームを題材に、**ドメイン駆動設計（DDD）**、**クリーンアーキテクチャ**、**フィーチャーデザイン（Feature-based Architecture）**などの設計思想を1歩ずつ確実に学ぶハンズオンプロジェクトです。

---

## 体系化されたドキュメント (docs/)

本リポジトリでは、「なぜその設計にしたのか」をすべて構造化ドキュメントとして残しています。

- **メタ・規約 (docs/00-meta/)**
  - [学習ロードマップ (roadmap.md)](docs/00-meta/roadmap.md)
  - [コーディング・設計規約 (conventions.md)](docs/00-meta/conventions.md)
  - [AI駆動開発とコンテキスト管理指針 (ai-driven-guidelines.md)](docs/00-meta/ai-driven-guidelines.md)
- **アーキテクチャ理論 (docs/01-architecture/)**
  - [DDDの思想と基礎概念 (01-ddd-philosophy.md)](docs/01-architecture/01-ddd-philosophy.md)
  - [エラーハンドリング戦略 (04-error-handling.md)](docs/01-architecture/04-error-handling.md)
  - [テスト設計戦略 (05-testing-strategy.md)](docs/01-architecture/05-testing-strategy.md)
- **ドメインモデル (docs/02-domain-models/)**
  - [ドメインモデル全体マップ・用語集 (overview.md)](docs/02-domain-models/overview.md)
  - [記事集約仕様書 (01-note-aggregate.md)](docs/02-domain-models/01-note-aggregate.md)
  - [購入集約仕様書 (02-purchase-aggregate.md)](docs/02-domain-models/02-purchase-aggregate.md)
- **設計決定記録 (docs/03-adr/)**
  - [ADR 0001: 初期アーキテクチャおよび設計方針の採択](docs/03-adr/0001-initial-architecture.md)
  - [ADR 0002: デプロイ基盤としての Vercel 採用および導入計画](docs/03-adr/0002-deployment-platform-vercel.md)
- **学習振り返りログ (docs/04-learning-logs/)**
  - [Step 00: 命名規則と基本概念 (step-00-conventions.md)](docs/04-learning-logs/step-00-conventions.md)
  - [Step 01: Value Object の実装と単体テスト (step-01-value-objects.md)](docs/04-learning-logs/step-01-value-objects.md)

---

## アーキテクチャ概要

```text
src/
├── features/               # 【ステップ3】フィーチャー単位の配置
│   ├── note/               # 記事関連機能
│   │   ├── domain/         # 【ステップ1】純粋なビジネスルール (Note, Price, Title)
│   │   ├── usecases/       # 【ステップ2】アプリケーションロジック (PublishNote, etc.)
│   │   ├── infrastructure/ # 【ステップ2】リポジトリ具象 (InMemoryNoteRepository, etc.)
│   │   └── presentation/   # 【ステップ3】UIコンポーネント, APIルート
│   └── purchase/           # 購入・アクセス権機能
└── shared/                 # 共通基盤
    ├── core/               # 汎用ユーティリティ (Result型)
    └── domain/             # ドメイン共通基底 (DomainError)
```

---

## コマンド一覧

```bash
# 依存関係のインストール
npm install

# ドメイン・ユースケースの単体テスト実行 (Vitest)
npm run test

# テストのウォッチモード
npm run test:watch

# TypeScript 型チェック
npm run typecheck
```

---

## AI伴走ルール (agent.md)
本プロジェクトは学習者とAI（Antigravity）のペアプログラミングで進められています。
AIが勝手にコードを完成させず、1ステップずつ解説・ディスカッション・テスト・ドキュメント化を徹底するための行動規範を [`agent.md`](agent.md) に定義しています。
