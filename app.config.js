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
    // 広告バナー用 ID
    AD_UNIT_BANNER_ID: process.env.EXPO_PUBLIC_AD_UNIT_BANNER_ID,
    // テスト端末 ID（任意）
    AD_TEST_DEVICE_ID: process.env.AD_TEST_DEVICE_ID,
  },
});
