/**
 * Jest の設定ファイル
 * Node.js を ES モジュールとして扱うため `export default` を使用する
 */
export default {
  testEnvironment: 'node',
  // tests フォルダのみを対象にする
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  // TypeScript ファイルを Babel で変換する設定
  transform: {
    '^.+\\.tsx?$': ['babel-jest']
  }
};
