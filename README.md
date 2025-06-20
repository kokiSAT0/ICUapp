# γ 計算アプリ

このリポジトリはノルアドレナリン、ドパミン、デクスメデトミジンの投与量と流量を相互に換算するシンプルな React Native アプリです。
UI には `react-native-paper` を利用し、投与量の単位は薬剤ごとに `src/config/drugs.ts` で設定されています。
`µg/kg/min` だけでなく `µg/kg/hr` 表示にも対応しています。

> **γ(ガンマ) 計算**とはノルアドレナリンなど昇圧薬の投与速度を体重あたりの量(µg/kg/min)とポンプの流量(ml/hr)の間で変換する作業を指します。

**注意: このアプリで計算される値はあくまでも参考情報であり、医学的な診断や治療方針を提供するものではありません。必ず医療行為は医師の指示に従ってください。**

## セットアップ方法

1. 依存関係の衝突を避けるため `package-lock.json` を削除してから
   `npm install --legacy-peer-deps` を実行します。
   Web 版を利用する場合は次のパッケージも追加でインストールしてください。
   `npx expo install react-dom react-native-web @expo/metro-runtime`

   **補足**: テストでは TypeScript を扱うため `sucrase` を使用します。
   `npm install` を実行すると開発用依存関係として
   `jest`（テストフレームワーク）も自動的にインストールされます。

2. `npm run lint` でコードの静的解析 (エラー検出) を行います。
3. `npm test` でテストを実行します。テストには `jest` を使用しており、
   `package.json` の `scripts.test` で実行方法を定義しています。
4. 開発を開始するには `npm start` を実行します。

## 環境変数の設定

アプリで利用する設定値は `.env` ファイルから読み込まれます。まずリポジトリに含まれる
`.env.example` をコピーして `.env` を作成してください。

```bash
cp .env.example .env
```

`.env` は個別の環境に合わせて値を変更できます。リポジトリには含めないため、誤って
コミットしないよう注意してください。

## Expo 設定ファイル

アプリの設定は `app.config.js` に統一されています。ファイル内では
`app.json` から読み込んだ内容と既存設定を関数形式でマージしています。
設定を変更する場合は `app.json` を編集してください。

## 開発フロー

GitHub Flow を採用しており、`feature/<topic>` ブランチで作業後 Pull Request
を送ります。コミットメッセージは `feat:` や `fix:` などの書式
(Conventional Commits) を用いてください。
主な手順は以下の通りです。

1. `npm run lint` でコードチェック
2. `npm test` で動作確認
3. 問題がなければ PR を作成

## ディレクトリ構成

```
assets/            アプリで使用する画像やフォント
tests/             Jest によるテストコード
src/
  components/      画面共通で使う UI コンポーネント
  screens/         画面単位のコンポーネント群
  contexts/        React Context を使った状態管理
  config/          薬剤設定など静的データ
  utils/           汎用的な計算処理
App.tsx            エントリーポイント。画面遷移や各種 Provider を設定
```

上記以外に `app.config.js` や `app.json` など Expo 固有の設定ファイルがあります。

## カスタマイズ例

薬剤の種類を増やす場合は `src/config/drugs.ts` に ID を追加します。
単位や初期値などの詳細設定は同じファイルで管理しています。
画面を増やしたい場合は `src/screens/` に新しいコンポーネントを作成し、
`App.tsx` のナビゲーション設定に追加してください。

## 用語補足

- **コンポーネント**: React で UI(画面の部品)を作るための再利用可能なパーツです。
- **Context(コンテキスト)**: 画面間で共有したい状態をまとめる仕組み。Provider と一緒に使います。
- **Provider(プロバイダ)**: Context を子コンポーネントに渡す役割を持つラッパーです。
- **Navigation(ナビゲーション)**: 画面遷移を管理する仕組みで、`react-navigation` を使用しています。
- **Lint(リンター)**: コードの問題点を自動検出するツールです。`npm run lint` で利用できます。
- **テスト**: コードが正しく動くか確認する仕組みです。`jest` を使っており、`npm test` で実行できます。

初心者でも読みやすいよう、極力ファイル数を減らしたシンプルな構成としています。

## 注意

Expo バンドル時に `assets/images` フォルダが存在しないとエラーになる場合があります。画像を追加しない場合でも空ディレクトリを作成しておくと安全です。

This project is licensed under the MIT License – see the LICENSE file for details.
