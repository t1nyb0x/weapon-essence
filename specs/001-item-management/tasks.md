# タスク: Endfield 武器＆スキル早見アプリ — ミニマム仕様

**入力**: `/specs/001-item-management/` | **ブランチ**: `001-item-management`\
**前提条件**: plan.md ✅ / spec.md ✅ / research.md ✅ / data-model.md ✅ / contracts/ ✅

## フォーマット: `[ID] [P?] [Story?] 説明（ファイルパス）`

- **[P]**: 並列実行可能（異なるファイル、未完了タスクへの依存なし）
- **[US1〜4]**: 属するユーザーストーリー
- 各タスクは追加コンテキストなしで LLM が完了できる粒度

---

## フェーズ1: セットアップ

**目的**: プロジェクト初期化と開発環境のセットアップ

- [x] T001 package.json + vite.config.ts + tsconfig.json + index.html を作成し Vite 8 + React 19 + TypeScript strict モードでプロジェクトをリポジトリルートに初期化（依存: react react-dom react-router-dom idb）
- [x] T002 [P] vitest.config.ts + tests/setup.ts を作成し Vitest 4.x + React Testing Library + jsdom + fake-indexeddb テスト環境を設定（T001 に依存）
- [x] T003 [P] package.json の scripts に dev / build / preview / test / test:watch / test:coverage / lint (oxlint src/) / format:check (oxfmt --check src/) / typecheck (tsc --noEmit) を追加（T001 に依存）

---

## フェーズ2: 基盤（全ユーザーストーリーのブロッキング前提条件）

**目的**: 全ユーザーストーリーが共通利用するコア型・定数・サービス・UI コンポーネント

**⚠️ 重要**: このフェーズが完了するまでユーザーストーリーの作業は開始不可

- [x] T004 [P] src/core/constants.ts を作成し WEAPON_IMAGE_DB_NAME / WEAPON_IMAGE_DB_VERSION / WEAPON_IMAGE_STORE_NAME / WEAPON_IMAGE_MAX_BYTES (5×1024×1024) / ALLOWED_MIME_TYPES を定義
- [x] T005 [P] src/core/models/types.ts を作成し Skill / Weapon / AllowedMimeType / UserWeaponImage インターフェース・型を定義（T004 に依存）
- [x] T006 [P] public/weapons.json を作成しサンプル武器データ（正常2件・スキルなし空配列1件・不正エントリ1件）を定義（data-model.md の JSON サンプルを参考）
- [x] T007 [P] src/components/ui/EmptyState.tsx + EmptyState.module.css を実装（message: string props を受け取り空状態メッセージを表示する汎用コンポーネント）
- [x] T008 [P] src/components/ui/ErrorBoundary.tsx + ErrorBoundary.module.css を実装（weapons.json 読み込み失敗・JSON パースエラー時のフォールバック画面。「データの読み込みに失敗しました。ページを再読み込みしてください」を表示）
- [x] T009 [P] src/components/ui/NotFound.tsx + NotFound.module.css を実装（存在しない weaponId でアクセス時の Not Found 画面。武器が存在しない旨と /weapons への導線を表示）
- [x] T010 src/core/ports/IImageStorage.ts を作成し getImage(weaponId): Promise\<UserWeaponImage | undefined\> / saveImage(image): Promise\<void\> / deleteImage(weaponId): Promise\<void\> の IImageStorage インターフェースを定義（T005 に依存）
- [x] T011 src/core/services/weaponLoader.ts を実装（fetch('public/weapons.json') + JSON.parse + isValidWeapon 型ガードで不正エントリを除外 + JSON 全体エラー時は throw する純粋関数。data-model.md のバリデーションルール参照）（T005 に依存）
- [x] T012 tests/unit/core/weaponLoader.test.ts を実装（正常データ全件取得・全壊 JSON throw・不正エントリ除外（他は表示継続）・武器0件・skills が空配列の各ケース）（T011 に依存）

**チェックポイント**: 基盤準備完了 — 以降のユーザーストーリーは並列で開始可能

---

## フェーズ3: ユーザーストーリー1 — 武器一覧を閲覧する（優先度: P1）🎯 MVP

**目標**: `weapons.json` の武器が名前・レアリティ・カテゴリ・プレースホルダー付きで一覧表示される

**独立テスト**: `weapons.json` に武器が1件以上ある状態で `npm run dev` を実行し、`/weapons` で全武器が一覧表示されることを確認。画像未設定武器もプレースホルダー表示でレイアウトが崩れないことを確認

- [x] T013 [P] [US1] src/components/weapon/WeaponCard.tsx + WeaponCard.module.css を実装（Weapon props を受け取り名前・レアリティ・カテゴリを表示。クリックで /weapons/:id に React Router Link 遷移。画像は props の imageUrl を表示し、未指定時は武器名の頭文字プレースホルダーを表示）
- [x] T014 [US1] src/components/weapon/WeaponList.tsx + WeaponList.module.css を実装（Weapon[] を受け取り WeaponCard を並べる。0件時は「武器データが見つかりません」の EmptyState を表示）（T013 に依存）
- [x] T015 [US1] src/pages/WeaponsPage.tsx を実装（`useLoaderData()` で weapons を受け取り WeaponList で一覧表示。フィルター状態は useState で管理）（T007, T014 に依存）
- [x] T016 [US1] src/App.tsx + src/main.tsx を作成し React Router v7 で `createBrowserRouter` / ルート定義を設定。`/weapons` ルートに `loader: weaponLoader` と `errorElement: <ErrorBoundary />` を設定。`/` → `/weapons` リダイレクト（T008, T011, T015 に依存）

**チェックポイント**: US1 完了 — `npm run dev` でアプリを開くと武器一覧が表示される

---

## フェーズ4: ユーザーストーリー2 — 武器のスキルをすばやく確認する（優先度: P1）

**目標**: 一覧から武器を選択すると詳細画面に遷移し、スキル名・効果説明が全件表示される

**独立テスト**: 一覧から武器をクリックし `/weapons/:weaponId` に遷移後、武器の基本情報とスキルセクション（スキル名・効果説明）が表示されることを確認。スキルなし武器では「スキルなし」が表示されることを確認

- [x] T017 [P] [US2] src/components/weapon/SkillList.tsx + SkillList.module.css を実装（Skill[] を受け取りスキル名・効果説明を表示。0件時は「スキルなし」の EmptyState を表示）
- [x] T018 [US2] src/components/weapon/WeaponDetail.tsx + WeaponDetail.module.css を実装（Weapon props と imageUrl?: string を受け取り、spec.md FR-004c のレイアウト優先順位（基本情報→スキル一覧→画像）で表示。SkillList を組み込む）（T017 に依存）
- [x] T019 [US2] src/pages/WeaponDetailPage.tsx を実装（URL :weaponId パラメータで武器を特定。見つからない場合は NotFound を表示。weaponLoader の結果から対象武器を特定し WeaponDetail に渡す）（T009, T011, T018 に依存）
- [x] T020 [US2] src/App.tsx に `/weapons/:weaponId` → WeaponDetailPage ルートを追加（T016, T019 に依存）

**チェックポイント**: US2 完了 — 一覧 → 詳細遷移とスキル表示が動作する。コアユースケース「スキル早見」が完結

---

## フェーズ5: ユーザーストーリー3 — ローカル画像を武器に設定する（優先度: P2）

**目標**: 詳細画面からローカル画像を選択・保存でき、ページ再読み込み後も画像が維持される

**独立テスト**: 詳細画面でファイル選択 → 保存 → ページ再読み込み後も設定画像が表示されることを確認。非対応フォーマット・5MB 超過でエラーメッセージが表示されることを確認。ネットワークリクエストに画像バイナリが含まれないことをブラウザ DevTools で確認

- [x] T021 [P] [US3] src/core/services/imageValidator.ts を実装（File を受け取り MIME タイプ・ファイルサイズを検証する純粋関数。検証成功は `{ ok: true }`、失敗は `{ ok: false; message: string }` を返す。spec.md FR-005a / FR-005b のエラーメッセージ文言を使用）
- [x] T022 [P] [US3] tests/unit/core/imageValidator.test.ts を実装（PNG/JPEG/WebP 通過・非対応 MIME 拒否・5MB 以下通過・5MB 超過拒否の各ケース）（T021 に依存）
- [x] T023 [P] [US3] src/adapters/indexeddb/IndexedDbImageStorage.ts を実装（IImageStorage の IndexedDB 実装。`idb` の openDB でモジュールスコープ・シングルトン初期化。`window.indexedDB` が未定義の環境では getImage → undefined / saveImage・deleteImage → no-op のフォールバック実装。saveImage は既存画像削除後に保存する（FR-005c））（T004, T010 に依存）
- [x] T024 [US3] tests/unit/adapters/IndexedDbImageStorage.test.ts を実装（fake-indexeddb を使用し saveImage・getImage・deleteImage・再設定時旧画像削除・IndexedDB 未対応フォールバック（no-op）の各ケースをテスト）（T023 に依存）
- [x] T025 [US3] src/components/image/WeaponImageUploader.tsx + WeaponImageUploader.module.css を実装（hidden file input + 「画像を設定」ボタン・「画像を削除」ボタン。ファイル選択後に imageValidator を呼び出しエラー時はメッセージ表示。成功時は onSave(file) / onDelete() コールバックを呼ぶ）（T021 に依存）
- [x] T026 [US3] src/pages/WeaponDetailPage.tsx を更新し WeaponImageUploader を統合（IndexedDbImageStorage を使って画像ロード・保存・削除を管理。保存失敗時は「画像の保存に失敗しました。再度お試しください」を表示しスキル表示への影響なし）（T023, T025 に依存）
- [x] T027 [US3] src/main.tsx を更新し IndexedDB の openDB 初期化を起動時に1度だけ実行して IndexedDbImageStorage インスタンスを生成し WeaponDetailPage に props 経由で渡す（T023 に依存）

**チェックポイント**: US3 完了 — 画像設定・削除・永続化が動作。IndexedDB 利用不可環境でもスキル閲覧に影響なし

---

## フェーズ6: ユーザーストーリー4 — 武器を名前・カテゴリ・レアリティで絞り込む（優先度: P3）

**目標**: 一覧画面で名前検索・カテゴリ・レアリティフィルターが AND 条件で適用できる

**独立テスト**: 検索ボックスに武器名の一部を入力すると一致する武器のみ表示されることを確認。カテゴリ/レアリティ選択後の絞り込みとフィルタークリア後の全件再表示を確認

- [x] T028 [P] [US4] src/core/services/weaponFilter.ts を実装（Weapon[] + `{ nameQuery: string; category: string | undefined; rarity: number | undefined }` を受け取り絞り込んだ Weapon[] を返す純粋関数。名前検索は部分一致・大小文字不区別。カテゴリ/レアリティは未指定時を全件対象とする AND 条件）
- [x] T029 [US4] src/pages/WeaponsPage.tsx を更新し名前検索 input・カテゴリ select・レアリティ select を追加し useState でフィルター状態を管理。カテゴリ・レアリティの選択肢は useLoaderData() の weapons から動的生成（カテゴリは undefined 除外・昇順、レアリティは存在値・昇順）。weaponFilter を呼び出して表示する武器を絞り込む。絞り込み結果が0件の場合は「条件に一致する武器はありません」（名前入力ありの場合は「"{検索語}" を含む武器はありません」）の EmptyState を表示（T015, T028 に依存）

**チェックポイント**: US4 完了 — 全ユーザーストーリーが独立して機能する

---

## フェーズ7: ポリッシュとクロスカッティング関心事

- [x] T030 [P] クリーンコード確認: src/ 全ファイルで命名の意図が明確か / 定数の constants.ts 集約漏れがないか / DRY 違反がないかを目視レビュー（コンスティテューション原則 I）
- [x] T031 [P] 早期リターン確認: src/ 全ファイルで `else` ブロック残存・ネスト2段超過がないかを確認し違反箇所を修正（コンスティテューション原則 II）
- [x] T032 [P] テスト容易性確認: IImageStorage DI 構造が設計通りか / weaponLoader・imageValidator が純粋関数として分離されているかを確認（コンスティテューション原則 III）
- [x] T033 [P] メソッドサイズ確認: src/ 全ファイルで30行超過の関数を列挙し超過理由を記録、60行超過は責務分割して修正（コンスティテューション原則 IV）
- [x] T034 [P] SRP 確認: Core / Adapters / Components / Pages の責務混在がないかを確認（例: IndexedDB 操作がコンポーネント内に直書きされていないか）（コンスティテューション原則 V）
- [x] T035 [P] npm run lint && npm run format:check && npm run typecheck をすべてグリーンにする
- [x] T036 npm run test で全テストがグリーンであることを確認（T035 に依存）
- [x] T037 [P] quickstart.md の手順（npm install → npm run dev → 武器一覧表示 → 詳細・スキル確認 → 画像設定フロー）を実行して動作を検証

---

## 依存関係と実行順序

### フェーズの依存関係

```
フェーズ1（セットアップ）
  └── フェーズ2（基盤）
        ├── フェーズ3（US1 武器一覧 P1）
        │     └── フェーズ4（US2 スキル詳細 P1）
        │           ├── フェーズ5（US3 画像管理 P2）
        │           └── フェーズ6（US4 絞り込み P3）  ← フェーズ5と並列可
        │                 └── フェーズ7（ポリッシュ）
```

### フェーズ内の並列実行例

| フェーズ | 並列グループ | 順次 |
| --- | --- | --- |
| Phase 2 | T004 / T005 / T006 / T007 / T008 / T009 を同時実行可 | → T010 → T011 → T012 |
| Phase 3 | T013 を先行 | → T014 → T015 → T016 |
| Phase 4 | T017 を先行 | → T018 → T019 → T020 |
| Phase 5 | T021 / T023 を同時実行可 | T022 は T021 後。T024 は T023 後。T025 → T026 → T027 |
| Phase 6 | T028 を先行 | → T029 |
| Phase 7 | T030 / T031 / T032 / T033 / T034 / T035 を同時実行可 | → T036 → T037 |

---

## 実装戦略

### MVP スコープ（推奨）

**最小動作可能プロダクト = フェーズ1 + フェーズ2 + フェーズ3 + フェーズ4**

US1（武器一覧）+ US2（スキル詳細）が完成した時点でアプリの主目的「スキル早見」が完結する。\
US3（画像管理）と US4（絞り込み）は独立した追加フィーチャーとして後から安全に実装できる。

### タスク数サマリー

| フェーズ | タスク数 | ユーザーストーリー |
| --- | --- | --- |
| セットアップ | 3 | — |
| 基盤 | 9 | — |
| US1（武器一覧） | 4 | P1 |
| US2（スキル詳細） | 4 | P1 |
| US3（画像管理） | 7 | P2 |
| US4（絞り込み） | 2 | P3 |
| ポリッシュ | 8 | — |
| **合計** | **37** | |
