# ICU ツールアプリ

このリポジトリは ICU で役立つ計算ツールをまとめた React Native アプリの雛形です。以下のツールを追加予定です。

- 流量計算 (μg/kg/min ⇔ ml/hr などの換算)
- GCS・RASS・SOFA・APACHE スコア計算

## セットアップ方法

1. 依存関係をインストールする前に `package-lock.json` が存在する場合は削除します。
   その後 `npm install --legacy-peer-deps` を実行してください。
   これで `@react-navigation` 関連の依存関係エラーを回避できます。
2. `npm run lint` でコードの静的解析 (エラー検出) を行います。
3. `npm test` でテストを実行します。
4. 開発を開始するには `npm start` を実行します。

## ディレクトリ構成

```
src/
  components/   各計算ツールの React コンポーネント
  screens/      画面ごとのコンポーネント
  navigation/   画面遷移の設定
```

## 用語補足

- **コンポーネント**: React で UI(画面の部品)を作るための再利用可能なパーツです。
- **ナビゲーション**: 画面遷移の仕組みです。`@react-navigation` を利用します。
- **Lint(リンター)**: コードの問題点を自動検出するツールです。`npm run lint` で利用できます。
- **テスト**: コードが正しく動くか確認する仕組みです。`jest` を使っており、`npm test` で実行できます。

初心者にも扱いやすいよう、なるべくシンプルな構成にしてあります。新しいツールを追加したい場合は `src/components` などにファイルを追加し、`navigation/AppNavigator.js` に画面を登録してください。
