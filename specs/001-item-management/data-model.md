# データモデル: Endfield 武器＆スキル早見アプリ

**フェーズ1 出力** | **日付**: 2026-04-15 | **更新日**: 2026-04-16

---

## エンティティ一覧

| エンティティ    | ストレージ                                                            | 更新タイミング             |
| --------------- | --------------------------------------------------------------------- | -------------------------- |
| RawWeapon       | `public/weapons/{category}.json`（カテゴリ別静的ファイル × 5）        | 手動編集のみ（FR-001a）    |
| Skill           | `public/effects/{type}-effects.json`（エフェクトファイル × 3）        | 手動編集のみ               |
| Weapon          | メモリ上（RawWeapon + category + uid + 解決済みスキルを合成したもの） | ロード時のみ               |
| UserWeaponImage | IndexedDB `weapon-images` ストア                                      | ユーザー操作（設定・削除） |

---

## ファイル構造

```
public/
  weapons/
    sword.json         # WeaponCategory: "sword"
    greatsword.json    # WeaponCategory: "greatsword"
    handcannon.json    # WeaponCategory: "handcannon"
    polearm.json       # WeaponCategory: "polearm"
    arts-unit.json     # WeaponCategory: "arts-unit"
  effects/
    base-effects.json       # SkillType: "base"
    additional-effects.json # SkillType: "additional"
    skill-effects.json      # SkillType: "skill"
```

---

## RawWeapon（JSON上の武器データ）

各カテゴリファイルに格納される静的データ。アプリはこれをロードして `Weapon` に変換する。

```typescript
type WeaponCategory =
  | "sword"
  | "greatsword"
  | "handcannon"
  | "polearm"
  | "arts-unit";

interface SkillRef {
  type: "base" | "additional" | "skill";
  id: number; // エフェクトファイル内の id と対応
}

interface RawWeapon {
  id: string; // 形式: "{category}_{n}"（例: "sword_1"）。ファイル内で一意
  name: string; // 非空文字列。表示名
  rarity: number; // 1 以上の整数
  description?: string; // 任意。省略時は詳細画面で非表示
  effectRefs: SkillRef[]; // スキル参照（スキルなし = []）
}
```

### バリデーションルール（各エントリ単位）

| フィールド   | 検証内容                                        | 違反時の挙動         |
| ------------ | ----------------------------------------------- | -------------------- |
| `id`         | 非空文字列（`string` かつ `length > 0`）        | 当該エントリを除外   |
| `name`       | 非空文字列                                      | 当該エントリを除外   |
| `rarity`     | 1 以上の整数（`Number.isInteger(v) && v >= 1`） | 当該エントリを除外   |
| `effectRefs` | 配列（`Array.isArray(v)`）                      | 当該エントリを除外   |
| JSON 全体    | 有効な JSON・配列形式                           | 全体エラー画面を表示 |

> **備考**: `effectRefs` が参照するスキル ID がエフェクトファイルに存在しない場合、そのスキル参照のみ無視し、残りのスキルは表示を継続する。

---

## Weapon（アプリ内部の武器オブジェクト）

RawWeapon をロード時に変換した内部表現。カテゴリと uid はファイルパスから注入される。

```typescript
interface Skill {
  id: number;
  type: "base" | "additional" | "skill";
  name: string; // スキル名
  description: string; // スキル効果説明（v1 ではレベル情報を含まない）
}

type Weapon = Omit<RawWeapon, "effectRefs"> & {
  category: WeaponCategory; // ロード時にファイル名から注入（JSON には存在しない）
  uid: string; // RawWeapon.id と同値。ルーティング・画像キーとして使用
  skills: Skill[]; // effectRefs を解決した結果
};
```

**`id` フォーマット**: `{category}_{n}`（例: `sword_1`, `arts-unit_1`）

- `{category}` は `WeaponCategory` の値と一致させること
- `{n}` は各カテゴリファイル内での連番（1 始まり）

---

## UserWeaponImage（ユーザー設定画像）

ユーザーが武器に紐づけたローカル画像。`weaponId`（= `Weapon.uid`）を Primary Key として IndexedDB に保存。

```typescript
type AllowedMimeType = "image/png" | "image/jpeg" | "image/webp";

interface UserWeaponImage {
  weaponId: string; // Weapon.uid と対応（Primary Key）
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
  └── 並行 fetch
        ├── /effects/base-effects.json
        ├── /effects/additional-effects.json
        └── /effects/skill-effects.json
              └── いずれか失敗 ──→ 全体エラー画面
              └── 成功 → skillMap を構築（"type:id" → Skill）

  └── 並行 fetch（カテゴリ × 5）
        ├── /weapons/sword.json
        ├── /weapons/greatsword.json
        ├── /weapons/handcannon.json
        ├── /weapons/polearm.json
        └── /weapons/arts-unit.json
              └── いずれか HTTP エラー / JSON パース失敗 ──→ 全体エラー画面
              └── 各ファイル成功
                    └── isValidRawWeapon() で各エントリを検証
                          ├── 不正エントリ ──→ 除外（コンソール警告）
                          └── 正常エントリ
                                └── effectRefs を skillMap で解決 → skills[]
                                └── category・uid を注入
                                └── Weapon として追加

  └── 全カテゴリを結合 → Weapon[] としてメモリ保持 → 一覧表示
```

---

## URL ルート vs データアクセス対応

| URL                   | 使用データ                                          |
| --------------------- | --------------------------------------------------- |
| `/weapons`            | `Weapon[]`（全件 or フィルター適用後）              |
| `/weapons/:weaponId`  | `Weapon`（ID 一致）+ `UserWeaponImage \| undefined` |
| 存在しない `weaponId` | Not Found 画面（Weapon[] 読み込み済みが前提）       |
