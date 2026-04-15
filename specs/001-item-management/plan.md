# 実装計画: Endfield 武器＆スキル早見アプリ — ミニマム仕様

**ブランチ**: `001-item-management` | **日付**: 2026-04-15 | **仕様**: [spec.md](./spec.md)
**入力**: `/specs/001-item-management/spec.md` からのフィーチャー仕様

## サマリー

Endfield の武器とそれに付随するスキル情報を素早く確認できる SPA。`weapons.json` を静的データソースとし、武器一覧（`/weapons`）と武器詳細（`/weapons/:weaponId`）の 2 画面構成。スキル表示（スキル名・効果説明）がコア機能であり、ローカル画像管理（IndexedDB）は補助機能として位置づける。サーバーレスで完結するフロントエンドのみの構成。

技術的アプローチ: React 19 + Vite 6 の CSR SPA。IndexedDB 操作は `IImageStorage` インターフェースを持つアダプター層に切り出す。データ読み込み・バリデーションは Core 層の純粋関数として実装し、テスト容易性を確保する。

## 技術コンテキスト

**言語/バージョン**: TypeScript 6.x（strict モード必須）\
**主要な依存関係**: React 19、Vite 8、React Router v7、idb 8.x（IndexedDB ラッパー）\
**ストレージ**: IndexedDB（ブラウザローカル、`idb` ライブラリ経由）\
**テスト**: Vitest 4.x + React Testing Library + jsdom + `fake-indexeddb`\
**ターゲットプラットフォーム**: モダンブラウザ（Chrome / Firefox / Safari 最新 2 バージョン）\
**プロジェクトタイプ**: Web SPA（フロントエンドのみ、サーバーなし）\
**パフォーマンス目標**: 100 件の武器データで一覧初期表示 3 秒以内（SC-002）\
**制約**: 画像データのサーバー送信禁止（FR-008）、IndexedDB 利用不可時の graceful degradation（FR-005d）、画像 5 MB 上限・PNG/JPEG/WebP のみ（FR-005a / FR-005b）\
**スケール/スコープ**: 単一ユーザー向けローカルアプリ。100 件規模の武器データ。サーバー不要

## コンスティテューションチェック

_ゲート: フェーズ0の調査前にパスする必要あり。フェーズ1の設計後に再チェック。_

> 参照: `.specify/memory/constitution.md` v2.0.0

| 原則               | このフィーチャーでの確認内容                                                                                                              | ステータス |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| I. クリーンコード  | `WEAPON_IMAGE_STORE_NAME` など IDB 関連定数を `constants.ts` に集約。`isValidWeapon` など意図が明確な命名。画像操作の DRY 化              | [x]        |
| II. 早期リターン   | `IndexedDB` 未対応ガード・武器 ID 不在ガード・ファイル未選択ガードを各関数の先頭で処理。`else` ブロック排除                               | [x]        |
| III. テスト容易性  | `IImageStorage` インターフェースにより IndexedDB を DI 可能。`weaponLoader` / `imageValidator` を純粋関数として分離しブラウザ不要でテスト | [x]        |
| IV. メソッドサイズ | 画像保存・取得・削除を個別関数に分割して各 30 行以内に収める。`WeaponDetailPage` のロジックも hooks へ分割                                | [x]        |
| V. SRP             | Core（ビジネスロジック）/ Adapter（IndexedDB）/ Components（UI）の責務を明確に分離                                                        | [x]        |
| 技術スタック       | `any` 型不使用（`unknown` + 型ガード）。Core 層はブラウザ固有 API 直呼び不使用。IndexedDB は起動時1度だけ初期化                           | [x]        |

## プロジェクト構造

### ドキュメント（このフィーチャー）

```text
specs/001-item-management/
├── plan.md              # このファイル
├── research.md          # フェーズ0の出力
├── data-model.md        # フェーズ1の出力
├── quickstart.md        # フェーズ1の出力
├── contracts/
│   ├── weapons-schema.json    # weapons.json の JSON Schema
│   └── indexeddb-schema.md   # IndexedDB ストア定義
└── tasks.md             # フェーズ2の出力（/speckit.tasks コマンドで作成）
```

### ソースコード（リポジトリルート）

```text
src/
├── core/
│   ├── constants.ts              # 定数（DB 名・ストア名・MIME タイプ・サイズ上限）
│   ├── models/
│   │   └── types.ts              # Weapon / Skill / UserWeaponImage / AllowedMimeType 型定義
│   ├── services/
│   │   ├── weaponLoader.ts       # weapons.json 読み込み・バリデーション（純粋関数）
│   │   └── imageValidator.ts     # 画像ファイルのサイズ・形式バリデーション（純粋関数）
│   └── ports/
│       └── IImageStorage.ts      # IndexedDB アダプターインターフェース
│
├── adapters/
│   └── indexeddb/
│       └── IndexedDbImageStorage.ts   # IImageStorage の実装（idb ライブラリ使用）
│
├── components/
│   ├── weapon/
│   │   ├── WeaponCard.tsx        # 一覧カードコンポーネント
│   │   ├── WeaponList.tsx        # 一覧コンポーネント（空状態・エラー含む）
│   │   ├── WeaponDetail.tsx      # 詳細コンポーネント（スキル・画像を含む）
│   │   └── SkillList.tsx         # スキル一覧コンポーネント（空状態含む）
│   ├── image/
│   │   └── WeaponImageUploader.tsx    # 画像設定・削除 UI
│   └── ui/
│       ├── EmptyState.tsx         # 空状態汎用コンポーネント
│       ├── ErrorBoundary.tsx      # エラーバウンダリ
│       └── NotFound.tsx           # 存在しない武器 ID アクセス時の画面
│
├── pages/
│   ├── WeaponsPage.tsx            # /weapons ルート（一覧＋検索フィルター）
│   └── WeaponDetailPage.tsx       # /weapons/:weaponId ルート
│
├── App.tsx                        # ルーター設定
└── main.tsx                       # エントリポイント・IndexedDB 初期化

public/
└── weapons.json                   # 武器データ（手動管理）

tests/
├── unit/
│   ├── core/
│   │   ├── weaponLoader.test.ts
│   │   └── imageValidator.test.ts
│   └── adapters/
│       └── IndexedDbImageStorage.test.ts   # fake-indexeddb 使用
└── integration/
    ├── WeaponsPage.test.tsx
    └── WeaponDetailPage.test.tsx
```

**構造の決定**: Web SPA（フロントエンド単体）。`core/` がビジネスロジック・型定義・インターフェースを持ち、`adapters/` が IndexedDB を抽象化、`components/` と `pages/` が UI を構成するレイヤード構造。サーバー不要でリポジトリルートが唯一のプロジェクト。

## 複雑性の追跡

_コンスティテューションチェックに正当化が必要な違反はなし_
