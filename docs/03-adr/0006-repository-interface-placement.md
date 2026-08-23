# ADR 0006: Repository インターフェースの配置場所の決定（usecases/ 配下への配置）

- **ステータス**: 承認 (Accepted)
- **決定日**: 2026-08-23
- **意思決定者**: プロダクトオーナー（開発者） & AI アーキテクト

---

## 1. コンテキストと課題 (Context & Problem)

Phase 2（Clean Architecture）の実装開始時、記事リポジトリのインターフェース（`INoteRepository`）を原典 DDD の慣習に従って `src/features/note/domain/` 配下に配置した。

しかし、以下の設計上の違和感と懸念が生じた：
- `domain/` は本来 `Note`, `Price`, `NoteTitle` などの **「純粋なビジネス概念・ルール」** のみを集約する聖域である。
- そこに「保存（`save`）」「取得（`findById`）」という **永続化（データベース操作）の気配を持つリポジトリが同居すること** に対する違和感。
- レイヤーごとの責務（何がドメインで、何がユースケースか）を初見の開発者にも一目で明確に伝える必要があった。

---

## 2. 検討した選択肢 (Options Considered)

### 選択肢1: `repositories/` フォルダを独立させる
```text
features/note/
├── domain/
├── repositories/   <-- INoteRepository.ts
├── usecases/
└── infrastructure/
```
- **メリット**: フォルダ名で役割が一目瞭然であり、直感性が高い。
- **デメリット**: 1〜2ファイルのためだけにフォルダが1つ増え、機能全体がフォルダだらけになりやすい（過剰な細分化）。

### 選択肢2: `domain/` に配置し続ける（原典 DDD のアプローチ）
```text
features/note/
├── domain/         <-- Note.ts, INoteRepository.ts
├── usecases/
└── infrastructure/
```
- **メリット**: エリック・エヴァンスの原典 DDD の教科書通り。
- **デメリット**: ドメイン層に永続化の関心事が混ざり、純粋なビジネスモデル（Entity/VO）の視認性が下がる。

### 選択肢3: `usecases/` 配下に配置する（Ports & Adapters / Clean Architecture の王道・採用）
```text
features/note/
├── domain/         <-- Note, Price, NoteTitle（純粋なモデルのみ！）
├── usecases/       <-- INoteRepository (Port), PublishNoteUseCase
└── infrastructure/ <-- InMemoryNoteRepository (Adapter)
```
- **メリット**:
  1. `domain/` が 100% 純粋なビジネスルールだけになり、ノイズが完全に排除される。
  2. 「リポジトリとは、**UseCase（手順）が外の世界（DB）に要求する接続口（ポート / Outgoing Port）** である」という Clean Architecture / ヘキサゴナルの定義と完全に一致する。
  3. `domain/`, `usecases/`, `infrastructure/` の3層にコンパクトに美しく収まる。
- **デメリット**: UseCase フォルダ内にインターフェースと同名のクラスが並ぶ（ただし命名 `INoteRepository` により明確に区別可能）。

---

## 3. 決定事項 (Decision)

**選択肢3（`usecases/` 配下への配置）をプロジェクト標準として採用する。**

各フィーチャーにおけるディレクトリ配置規約を以下のように確定する：

```text
src/features/<feature_name>/
├── domain/                  # 純粋なビジネスルール（Entity, Value Object, ファクトリ）
├── usecases/                # アプリケーションロジック ＆ 外部接続口（UseCase, I*Repository）
└── infrastructure/          # 接続口を実装する技術の具象（InMemory*Repository, Prisma*Repository）
```

---

## 4. 得られる効果とトレードオフ (Consequences)

### ポジティブな影響
- **ドメインの純粋性の最大化**: ドメイン層がデータベースや保存方法の存在を一切意識しない完全な独立を達成。
- **認知負荷の削減**: ディレクトリが機能ごとに3つの標準的な小部屋に整理され、誰が読んでも迷いがない。
- **DIP（依存性の逆転）の明瞭化**: `infrastructure/`（Adapter）が `usecases/`（Port）を実装するという関係性がディレクトリ構造と完全一致する。

### トレードオフと留意点
- 他の古典的DDDプロジェクト（`domain/` にリポジトリを置く構成）から移ってきた開発者向けに、本 ADR を参照して「Clean Architecture / Ports & Adapters に基づく配置である」ことを周知する。
