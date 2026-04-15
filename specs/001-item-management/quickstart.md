# クイックスタート: Endfield 武器＆スキル早見アプリ

**フェーズ1 出力** | **日付**: 2026-04-15

---

## 前提条件

| ツール   | バージョン                                |
| -------- | ----------------------------------------- |
| Node.js  | 24.x 以上                                 |
| npm      | 10.x 以上                                 |
| ブラウザ | Chrome / Firefox / Safari 最新2バージョン |

---

## セットアップ

```bash
# リポジトリのクローン（初回のみ）
git clone <repository-url>
cd weapon-essential

# 依存パッケージのインストール
npm install

# 開発サーバー起動 → http://localhost:5173
npm run dev
```

---

## 武器データの管理

`public/weapons.json` を直接編集してください。  
スキーマは [`specs/001-item-management/contracts/weapons-schema.json`](../contracts/weapons-schema.json) を参照。

**最小サンプル**:

```json
[
  {
    "id": "weapon-001",
    "name": "サンプル武器",
    "rarity": 5,
    "category": "sword",
    "description": "武器説明テキスト",
    "skills": [
      {
        "name": "スキルA",
        "description": "スキルの効果説明テキスト"
      }
    ]
  }
]
```

> `skills` は必須フィールドです。スキルがない場合は `"skills": []` と記述してください。

---

## 利用可能なスクリプト

| コマンド                | 内容                                   |
| ----------------------- | -------------------------------------- |
| `npm run dev`           | 開発サーバー起動（ホットリロード付き） |
| `npm run build`         | プロダクションビルド（`dist/` に出力） |
| `npm run preview`       | ビルド成果物のローカルプレビュー       |
| `npm run test`          | テスト実行（Vitest）                   |
| `npm run test:watch`    | テストウォッチモード                   |
| `npm run test:coverage` | カバレッジレポート生成                 |
| `npm run lint`          | Lint チェック（oxlint）                |
| `npm run typecheck`     | 型チェック（`tsc --noEmit`）           |

---

## テスト実行

```bash
# 全テストを一度実行
npm run test

# 変更を監視しながら実行（開発時推奨）
npm run test:watch

# カバレッジ付きで実行
npm run test:coverage
```

---

## プロダクションビルド

```bash
npm run build
# dist/ ディレクトリに静的ファイルが出力される
# 静的ホスティング（Netlify / Vercel / GitHub Pages 等）にデプロイ可能
```

---

## ディレクトリ構成（参考）

```
src/
├── core/
│   ├── constants.ts           # 定数（DB名、MIME タイプ等）
│   ├── models/types.ts        # Weapon / Skill / UserWeaponImage 型定義
│   ├── services/
│   │   ├── weaponLoader.ts    # weapons.json 読み込み・バリデーション
│   │   └── imageValidator.ts  # 画像ファイルのバリデーション
│   └── ports/IImageStorage.ts # IndexedDB アダプターインターフェース
├── adapters/
│   └── indexeddb/
│       └── IndexedDbImageStorage.ts  # IImageStorage の実装
├── components/
│   ├── weapon/                # WeaponCard / WeaponList / WeaponDetail / SkillList
│   ├── image/                 # WeaponImageUploader
│   └── ui/                   # EmptyState / ErrorBoundary / NotFound
├── pages/
│   ├── WeaponsPage.tsx        # /weapons ルート
│   └── WeaponDetailPage.tsx   # /weapons/:weaponId ルート
├── App.tsx
└── main.tsx

public/
└── weapons.json               # 武器データ（手動管理）

tests/
├── unit/
│   ├── core/                  # weaponLoader / imageValidator テスト
│   └── adapters/              # IndexedDbImageStorage テスト（fake-indexeddb）
└── integration/               # ページコンポーネントのインテグレーションテスト
```

---

## よくある問題

### 武器が一覧に表示されない

- `public/weapons.json` が存在し、有効な JSON であるか確認してください
- ブラウザの開発者ツール（コンソール）でバリデーションエラーが出ていないか確認してください
- 不正なエントリは除外されますが、コンソールに警告が表示されます

### 画像が保存されない

- ブラウザが IndexedDB をサポートしているか確認してください（Chrome / Firefox / Safari 最新版は対応済み）
- ファイルサイズが **5 MB 以下**、形式が **PNG / JPEG / WebP** であるか確認してください

### 型エラーが発生する

```bash
npm run typecheck
```

で型エラーの詳細を確認してください。
