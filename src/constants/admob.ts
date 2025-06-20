import Constants from 'expo-constants';

// Expo 設定から広告ユニットIDを取得する
export const AD_UNIT_BANNER_ID =
  Constants.expoConfig?.extra?.AD_UNIT_BANNER_ID ?? '';

// テスト端末IDが設定されていれば取得する
export const AD_TEST_DEVICE_ID =
  Constants.expoConfig?.extra?.AD_TEST_DEVICE_ID ?? '';
