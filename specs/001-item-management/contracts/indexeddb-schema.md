# IndexedDB スキーマ

**フェーズ1 出力** | **日付**: 2026-04-15

---

## データベース設定

| プロパティ     | 値                    |
| -------------- | --------------------- |
| データベース名 | `weapon-essential-db` |
| バージョン     | `1`                   |

---

## オブジェクトストア: `weapon-images`

| プロパティ      | 値         |
| --------------- | ---------- |
| `keyPath`       | `weaponId` |
| `autoIncrement` | `false`    |
| インデックス    | なし       |

---

## レコード構造

| フィールド  | 型                                            | 制約                                         |
| ----------- | --------------------------------------------- | -------------------------------------------- |
| `weaponId`  | `string`                                      | Primary Key。`Weapon.id` と対応。非空        |
| `blob`      | `Blob`                                        | 画像バイナリ。5 MB 以下、MIME タイプ制限あり |
| `fileName`  | `string`                                      | 元のファイル名                               |
| `mimeType`  | `"image/png" \| "image/jpeg" \| "image/webp"` | 許可された MIME タイプのみ                   |
| `updatedAt` | `Date`                                        | 保存・更新日時                               |

---

## 操作インターフェース（`IImageStorage`）

```typescript
interface IImageStorage {
  /** 武器画像を取得する。未設定の場合は undefined を返す */
  getImage(weaponId: string): Promise<UserWeaponImage | undefined>;

  /** 武器画像を保存・上書きする。既存画像は削除してから保存する（FR-005c） */
  saveImage(image: UserWeaponImage): Promise<void>;

  /** 武器画像を削除する */
  deleteImage(weaponId: string): Promise<void>;
}
```

---

## フォールバック挙動（IndexedDB 利用不可時）

`window.indexedDB` が `undefined` の場合（FR-005d）:

- `getImage` → `undefined` を返す（画像未設定として扱う）
- `saveImage` → 何もしない（no-op）
- `deleteImage` → 何もしない（no-op）

スキル閲覧機能は IndexedDB の可用性に影響されず通常通り動作する。

---

## マイグレーション戦略

- **v1**: マイグレーション不要
- **将来のバージョンアップ**: `openDB` の `upgrade` コールバック（`onupgradeneeded`）で対応する

---

## 実装ノート

- IndexedDB の初期化（`openDB` 呼び出し）はアプリ起動時に1度だけ行う（コンスティテューション 技術スタック制約）
- `openDB` は `src/adapters/indexeddb/IndexedDbImageStorage.ts` 内でモジュールスコープのシングルトンとして保持する
