# 学習振り返りログ: Step 02 Feature-based Clean Architecture と UseCase 設計

- **カテゴリ**: 学習ログ (`docs/04-learning-logs/`)
- **日付**: 2026-08-24
- **テーマ**: ドメイン層（ルール）とユースケース層（手順）の住み分け、依存性の逆転（DIP）、UseCase の実装パターン比較

---

## 1. 今回学んだ設計の核心 (Core Insights)

### ① ルールの「3階層構造」（役割分担）
ルールやバリデーションは、担当範囲に応じて明確に3つの階層に住み分ける。

1. **部品のルール（Value Object）**: `Price`, `NoteTitle` など。自身の「値としての正しさ」だけを守る。
2. **集約のルール（Aggregate Root: Note）**: `note.publish()` など。部品を束ねて「状態変化のビジネス不変条件」を守る門番。
3. **手順のルール（UseCase: PublishNoteUseCase）**: 「DBから持ってくる ➔ 認可確認 ➔ ドメインメソッド実行 ➔ DBに保存」という全体の段取りを指揮する。

### ② コンストラクタ・インジェクション（DI）の必要性
- UseCase が仕事をするために必須の道具（`INoteRepository`）は、クラス生成時（`constructor`）に外から注入する。
- これにより、本番環境では `PrismaNoteRepository`、テスト環境では `InMemoryNoteRepository` と差し替えが可能になり、高速な単体テストが実現する。

### ③ UseCase の実装パターン比較
TypeScript における UseCase の実装には以下の選択肢があるが、単一責任の原則（1ファイル＝1ユースケース）と DI・Result 型との親和性から、**「1クラス 1メソッド（`execute`）型」** をプロジェクト標準として採用。

| パターン | 特徴 | 評価 |
| :--- | :--- | :--- |
| **1クラス 1メソッド型**（採用） | `class ...UseCase { constructor(repo) {} execute() {} }` | 最も標準的で誰が見ても分かりやすく、依存関係が明瞭 |
| **高階関数型（クロージャ）** | `const createUseCase = (repo) => async () => {}` | 関数型だが、初心者にはクロージャの認知負荷がある |
| **引数渡し関数型** | `function execute(repo, input) {}` | 呼び出し側（画面）が毎回 repo を持ち歩く必要があり汚れる |

### ④ 複数集約の協調とユースケースの責務（PurchaseNoteUseCase）
- **異なるフィーチャーの協調**: 購入機能（`features/purchase/`）は、記事機能（`features/note/`）の `INoteRepository` と自身の `IPurchaseRepository` の2つを注入して協調動作する。
- **検証の住み分け**:
  - 「既に買っているか？（二重購入）」は過去の履歴が必要なため、リポジトリを持つ **UseCase 層** でチェック。
  - 「著者が自分の記事を買おうとしていないか？」「販売中か？」は、ドメイン知識そのものなので **`Purchase.create()` 集約内** でチェック。
  - ルールの種類に応じて、どこでガードを張るべきかを明確に分離した。

---

## 2. 関連ドキュメント
- [ADR 0006: Repository インターフェースの配置場所の決定（usecases/ 配下への配置）](../03-adr/0006-repository-interface-placement.md)
- [Feature-based Clean Architecture 設計思想](../01-architecture/03-clean-architecture-and-features.md)
