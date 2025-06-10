// Expo 向けの標準設定を使用するため `babel-preset-expo` を利用する
// `api.cache(true)` を呼び出すことでビルド速度を改善する
export default function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo']
  };
}
