# AGENTS.md – AI Coding Guide for Expo App Development

このファイルは **コーディング AI (ChatGPT／Codex 等)** に対する唯一の指示書です。ここに書かれたガイドラインに従ってコード・ドキュメント・コミットを生成してください。

---

## 1. 目的

- 流量換算アプリを **Expo Managed (iOS / Android)** で開発する。

## 2. 技術スタック (固定)

- **Node.js:** 20.19.2
- **Expo SDK:** 53.0.9
- **Package Manager:** npm 10+
- **UI ライブラリ:** `react-native-paper@^5.14.4`
- **TypeScript:** `"strict": false` で開始（段階的に厳格化）

## 3. リポジトリ構成

```
my-expo-app/
├── app/                # Expo Router ページ
├── components/         # 再利用 UI
├── assets/             # 画像・フォント
├── .env.example        # 環境変数サンプル
├── eas.json            # EAS 設定
├── .eslintrc.cjs       # ESLint
├── jest.config.js      # Jest
└── README.md
```

## 4. Git 運用

- **GitHub Flow:** `main` → `feature/<topic>` → PR → `main`
- **コミット:** Conventional Commits (例: `feat:`, `fix:`)

## 5. CI / CD

- **プラットフォーム:** GitHub Actions
- **手順:** `npm ci` → `npm run lint` → `npm test`
- **ビルド:** `eas build --profile preview` (main push)／`eas build --profile production` (tag)
- **Secrets:** `.env` (ローカル)／GitHub Secrets & EAS Secrets (CI・Build)

## 6. コード品質

- ESLint + Prettier
- Jest + `@testing-library/react-native`
- Husky: pre‑commit で `npm run lint --fix`

## 7. AI への指示

### 7.1 フォーマット

- **言語:** 日本語
- **コードブロック:** `tsx / `ts / \`\`\`bash など言語名を指定
- **追加パッケージ:** `npm install` コマンドを併記

### 7.2 コーディングルール

| ルール       | 内容                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------- |
| UI           | **必ず `react-native-paper` を使用**。原生 `react-native` コンポーネントはラップして使う |
| 型           | `export type XxxProps = { ... }` を必ず定義                                              |
| エラー処理   | `try / catch` を省略しない。ユーザー通知は `Snackbar` or `Alert`                         |
| データ取得   | `@tanstack/react-query` 経由で fetch をラップ                                            |
| スタイリング | `StyleSheet.create` に統一。インラインスタイル禁止                                       |

### 7.3 チェックリスト

1. `react-native-paper` を使ったか？
2. 型定義はあるか？
3. コメントは日本語か？
4. 不要 import はないか？
5. `npm run lint` がエラーゼロで通るか？

## 8. Secrets & Security

- 機密は `.env` と GitHub／EAS Secrets にのみ置く。
- `.env.example` にダミー値をコミットして項目を共有。

## 9. リリース

- 内部配布: TestFlight (iOS) / Google Play Internal Testing (Android)
- バージョン: SemVer (`1.0.0` → `1.0.1`)

## 10. コミュニケーション

- メンバー 2 名は毎日対面で共有する。追加ツールは不要。

## 11. ADR (Architecture Decision Record)

- 重要な技術選定は `docs/adr/` に Markdown で記録。

---

_Last updated: 2025‑06‑04_
