# Phase 7: NestJS への移行と学習スケジュール

本ドキュメントは、現在の Next.js フルスタック構成から、ドメイン資産を活かしたまま **「NestJS ＋ Turborepo モノレポ構成」** へと段階的に移行するための、学習および作業のステップバイステップ・ロードマップである。

一気に作り変えるのではなく、「NestJSの概念の学習」と「小さな移行」を繰り返しながら、確実にアーキテクチャへの理解を深めることを目的とする。

---

## 📅 ステップごとの移行・学習スケジュール

### Step 1: 【学習】NestJS のコア概念を理解する (★現在ここ)
いきなりコードを動かす前に、NestJSの3大要素（デコレーター駆動開発）を学ぶ。
- **Controller (コントローラー)**: APIの入り口。HTTPリクエストを受け取り、レスポンスを返す。
- **Provider (プロバイダー / サービス)**: ビジネスロジック（UseCase）やDBアクセス（Repository）を担当するクラス。
- **Module (モジュール)**: これらをガッチリ結合させるための箱。
- **DI (依存性注入)**: 今まで `new InMemoryRepository()` のように手動でやっていた作業を、NestJSが裏側でどう自動化するのか（IoCコンテナ）の仕組み。

### Step 2: 【環境】モノレポ (Turborepo) の土台作り
NestJS を安全に迎え入れるための「部屋割り」を行う。
- 現在の Next.js プロジェクト全体を `apps/web/` に移動する。
- リポジトリのルートで Turborepo を初期化し、複数プロジェクト（フロントとバックエンド）を同時にビルド・起動できる土台を作る。
- ※この時点では Next.js はそのまま動き続けるため、壊れる心配はない。

### Step 3: 【分離】ドメイン資産の「共有パッケージ化」
Phase 1〜4で作ってきたピュアな TypeScript コードを分離する。
- `src/features/*/domain` や `schemas` などのフォルダを、Next.js から引き剥がして `packages/core/` などの共通パッケージフォルダに移動する。
- 移行後もNext.jsが壊れていないか、単体テスト（Vitest）がすべてパスするかを確認する。

### Step 4: 【構築】NestJS アプリの立ち上げとドメインのインポート
いよいよバックエンドの主役を登場させる。
- `apps/api/` に新しい NestJS プロジェクトを作成する。
- Step 3 で切り出した `packages/core/` のドメインコード（EntityやZodスキーマ）を NestJS 側で `import` して使えることを確認する。

### Step 5: 【実装】UseCase と Repository の NestJS 化 (DIの実践)
学んだDI（依存性注入）を実際にコードに落とし込む。
- 現在 Next.js の Server Actions の中で呼び出している UseCase を、NestJS の `@Injectable()`（プロバイダー）として登録する。
- Prisma (DBアクセス) を NestJS の作法に乗っとって構築し直す。

### Step 6: 【実装】API コントローラーの作成
- NestJS の `@Controller()` を使い、スマホアプリやフロントエンドから呼び出せる REST API（または GraphQL エンドポイント）を作成する。
- 異常系（Zodのエラー等）を NestJS の Exception Filter で綺麗に返す仕組みを学ぶ。

### Step 7: 【結合】Next.js の「純粋なUI（Headless）」化
- Next.js から、ついに Server Actions や Prisma を完全削除する。
- Next.js の画面コンポーネントが、Step 6 で作った NestJS の API を叩いて画面を描画する（クライアント・サーバー完全分離の完成）。

---
※ 各ステップが完了するごとに、このドキュメントにチェックを入れ、コミットしていく。
