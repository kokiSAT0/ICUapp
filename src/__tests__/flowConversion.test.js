import test from 'node:test';
import assert from 'node:assert/strict';
// sucrase を使って TypeScript ファイルを読み込む設定
import 'sucrase/register/ts.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const {
  convertDoseToRate,
  convertRateToDose,
  DEFAULT_CONCENTRATION,
} = require('../utils/flowConversion.ts');

// 投与量->流量の換算テスト
// 例: 50kg の患者に 0.1µg/kg/min 投与する場合
// 濃度 100µg/ml のため期待される流量は 3ml/hr

test('convert dose to rate', () => {
  const rate = convertDoseToRate(0.1, 50, DEFAULT_CONCENTRATION);
  assert.ok(Math.abs(rate - 3) < 1e-6);
});

// 流量->投与量の換算テスト
// 上記と逆の計算を行い、0.1µg/kg/min が得られるか確認

test('convert rate to dose', () => {
  const dose = convertRateToDose(3, 50, DEFAULT_CONCENTRATION);
  assert.ok(Math.abs(dose - 0.1) < 1e-6);
});

// 体重が 0 の場合は NaN になることを確認
test('zero weight returns NaN', () => {
  assert.ok(Number.isNaN(convertDoseToRate(0.1, 0, DEFAULT_CONCENTRATION)));
  assert.ok(Number.isNaN(convertRateToDose(3, 0, DEFAULT_CONCENTRATION)));
});

// 体重が負の場合も NaN
test('negative weight returns NaN', () => {
  assert.ok(Number.isNaN(convertDoseToRate(0.1, -5, DEFAULT_CONCENTRATION)));
  assert.ok(Number.isNaN(convertRateToDose(3, -5, DEFAULT_CONCENTRATION)));
});

