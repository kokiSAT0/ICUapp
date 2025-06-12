import 'dotenv/config';
import appJson from './app.json' assert { type: 'json' };

/**
 * Expo 設定を関数形式で出力する
 * 引数 `config` は既存設定を表すオブジェクト
 */
export default ({ config }) => ({
  // app.json の内容と既存設定をマージする
  ...config,
  ...appJson.expo,
  extra: {
    ...(config.extra ?? {}),
    ...(appJson.expo.extra ?? {}),
    // 環境変数から薬液濃度を読み込む
    DRUG_CONCENTRATION: process.env.DRUG_CONCENTRATION,
  },
});
