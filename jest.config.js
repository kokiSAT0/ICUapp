
/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  // テストファイルは tests ディレクトリにまとめる
  // 拡張子は js と ts の両方を対象にする
  testMatch: ['<rootDir>/tests/**/*.test.{js,ts}'],
  // TypeScript ファイルを Sucrase で変換する
  transform: {
    '^.+\\.(ts|tsx)$': ['<rootDir>/scripts/jestTransformer.cjs']

  }
};
