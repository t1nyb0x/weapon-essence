# データモデル: Endfield 武器＆スキル早見アプリ

**フェーズ1 出力** | **日付**: 2026-04-15

---

## エンティティ一覧

| エンティティ    | ストレージ                                         | 更新タイミング             |
| --------------- | -------------------------------------------------- | -------------------------- |
| Weapon          | `public/weapons.json`（静的ファイル）              | 手動編集のみ（FR-001a）    |
| Skill           | `weapons.json` 内の `skills` 配列（Weapon に内包） | Weapon と同じ              |
| UserWeaponImage | IndexedDB `weapon-images` ストア                   | ユーザー操作（設定・削除） |

---

## Weapon（武器）

`weapons.json` に定義される静的データ。アプリ起動時に `fetch` してメモリ上に保持する。

```typescript
interface Skill {
  name: string; // 非空文字列。スキル名
  description: string; // スキル効果説明（v1 ではレベル情報を含まない）
}

interface Weapon {
  id: string; // 非空文字列。一覧内で一意
  name: string; // 非空文字列。表示名
  rarity: number; // 1 以上の整数（小数・負数・0 は不正値）
  category?: string; // 任意。未設定時はフィルターで「全件」扱い
  description?: string; // 任意。未設定時は詳細画面で非表示
  skills: Skill[]; // 必須（スキルなし = 空配列 []）
}
```

### バリデーションルール（各エントリ単位）

| フィールド | 検証内容                                        | 違反時の挙動         |
| ---------- | ----------------------------------------------- | -------------------- |
| `id`       | 非空文字列（`string` かつ `length > 0`）        | 当該エントリを除外   |
| `name`     | 非空文字列                                      | 当該エントリを除外   |
| `rarity`   | 1 以上の整数（`Number.isInteger(v) && v >= 1`） | 当該エントリを除外   |
| `skills`   | 配列（`Array.isArray(v)`）                      | 当該エントリを除外   |
| JSON 全体  | 有効な JSON（`JSON.parse` が throw しないこと） | 全体エラー画面を表示 |

> **備考**: JSON 形式は正しいが一部エントリが不正な場合は、正常なエントリのみ表示を継続する（仕様「データ読み込みエラーの区別」）。

---

## UserWeaponImage（ユーザー設定画像）

ユーザーが武器に紐づけたローカル画像。`weaponId` を Primary Key として IndexedDB に保存。

```typescript
type AllowedMimeType = "image/png" | "image/jpeg" | "image/webp";

interface UserWeaponImage {
  weaponId: string; // Weapon.id と対応（Primary Key）
  blob: Blob; // 画像バイナリ
  fileName: string; // 元のファイル名
  mimeType: AllowedMimeType; // 許可された MIME タイプのみ
  updatedAt: Date; // 保存・更新日時
}
```

### バリデーションルール（ファイル選択時）

| フィールド  | 検証内容                                       | エラーメッセージ                                     |
| ----------- | ---------------------------------------------- | ---------------------------------------------------- |
| `mimeType`  | `image/png` / `image/jpeg` / `image/webp` のみ | 「PNG・JPEG・WebP 形式のファイルを選択してください」 |
| `blob.size` | 5,242,880 bytes（5 MB）以下                    | 「ファイルサイズは 5MB 以下にしてください」          |

---

## 定数

```typescript
const WEAPON_IMAGE_DB_NAME = "weapon-essential-db";
const WEAPON_IMAGE_DB_VERSION = 1;
const WEAPON_IMAGE_STORE_NAME = "weapon-images";
const WEAPON_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES: AllowedMimeType[] = [
  "image/png",
  "image/jpeg",
  "image/webp",
];
```

---

## 状態遷移: 武器画像

```
[未設定]
  ├── 画像選択・バリデーション通過・保存成功 ──→ [設定済み]
  └── IndexedDB 利用不可 ──→ [未設定（固定）]

[設定済み]
  ├── 画像削除 ──→ [未設定]
  └── 画像再設定
        ├── 旧画像削除 → 新画像保存成功 ──→ [設定済み（新画像）]
        └── 保存失敗 ──→ [設定済み（旧画像）]  ※スキル閲覧は影響なし
```

---

## データ読み込みフロー

```
アプリ起動
  └── fetch('public/weapons.json')
        ├── ネットワークエラー / レスポンスエラー ──→ 全体エラー画面
        ├── JSON.parse 失敗 ──→ 全体エラー画面
        └── 成功
              └── isValidWeapon() で各エントリを検証
                    ├── 不正エントリ ──→ 除外（コンソール警告）
                    └── 正常エントリ ──→ Weapon[] として保持 ──→ 一覧表示
```

---

## URL ルート vs データアクセス対応

| URL                   | 使用データ                                          |
| --------------------- | --------------------------------------------------- |
| `/weapons`            | `Weapon[]`（全件 or フィルター適用後）              |
| `/weapons/:weaponId`  | `Weapon`（ID 一致）+ `UserWeaponImage \| undefined` |
| 存在しない `weaponId` | Not Found 画面（Weapon[] 読み込み済みが前提）       |
