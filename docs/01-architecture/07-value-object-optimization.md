# 値オブジェクトの最適化戦略：ファクトリメソッドと Flyweight パターン

- **カテゴリ**: アーキテクチャ理論 (`docs/01-architecture/`)
- **テーマ**: 不変性（Immutability）を活かしたメモリ最適化とカプセル化の恩恵

---

## 1. 課題：頻出する値オブジェクトによるメモリ消費

大規模なWebアプリケーション（特に無料記事が大量に閲覧されるようなプラットフォーム）では、同一の不変値（例: `Price(0)`）がリクエストごとに何十万回も生成されると、以下の問題が発生する：

1. **不要なメモリ確保**: まったく同一の中身を持つオブジェクトが大量にヒープメモリを占有する。
2. **ガベージコレクション（GC）の負荷**: 短命なオブジェクトが大量に破棄され、Node.jsのGC実行頻度が高まりレイテンシが悪化する。

---

## 2. 解決策：静的ファクトリメソッド ＋ Flyweight パターン

値オブジェクトが **完全不変（Immutable / readonly）** であるという性質を利用し、**「頻出するインスタンスを事前に1つだけ生成・キャッシュし、全員でその参照を共有する」** 設計（Flyweight パターン）を適用する。

### 実装例 (`Price.ts`)

```typescript
export class Price {
  public static readonly FREE_AMOUNT = 0;

  // ① 0円のインスタンスを事前に1個だけ保持（メモリ消費は1個分のみ）
  private static readonly ZERO = new Price(Price.FREE_AMOUNT);

  private constructor(private readonly value: number) {}

  public static create(value: number): Result<Price, InvalidPriceError> {
    // バリデーション
    if (value !== Price.FREE_AMOUNT && (value < Price.MIN_AMOUNT || value > Price.MAX_AMOUNT)) {
      return Result.err(new InvalidPriceError(value));
    }

    // ② 0円の場合は、キャッシュされた同一インスタンスを使い回す
    if (value === Price.FREE_AMOUNT) {
      return Result.ok(Price.ZERO);
    }

    return Result.ok(new Price(value));
  }
}
```

---

## 3. なぜインスタンスを共有しても安全なのか？

ミュータブル（可変）なオブジェクトを共有すると、1人が値を書き換えた際に全員に影響する副作用（Side Effect）のバグが発生する。

しかし、値オブジェクトは **Setter を持たず、内部フィールドが `readonly` で保護されている** ため、**何百万人・何億回アクセスが来ても値が書き換わることは物理的にあり得ない**。
不変性（Immutability）が担保されているからこそ、安全にインスタンスを使い回すことができる。

---

## 4. 静的ファクトリメソッド（カプセル化）の最大の恩恵

もし外部から `new Price(0)` と直接書かせていた場合、後からキャッシュ最適化を導入しようとすると、呼び出し側のコードを全修正する必要が生じる。

最初から `Price.create(0)` という**静的ファクトリメソッドを門番（窓口）として用意していたため、呼び出し側のコードに1行も手を加えることなく、クラス内部の修正だけでパフォーマンス改善を完了できた**。
これがオブジェクト指向およびDDDにおける「カプセル化（情報隠蔽）」の最大の価値である。

---

## 5. 自動テストによる参照一致の検証

Vitest の `toBe` マッチャー（メモリ上のアドレスの一致検証）を用いることで、何度生成しても同一インスタンスが返却されていることを自動テストで証明できる。

```typescript
it("0円の Price は何度生成しても同一インスタンス（キャッシュ・参照一致）を返すこと", () => {
  const result1 = Price.create(0);
  const result2 = Price.create(0);

  // toBe は「参照先のアドレスが同一か」を検証する
  expect(result1.value).toBe(result2.value);
});
```
