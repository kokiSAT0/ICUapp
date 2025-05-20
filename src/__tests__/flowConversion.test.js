import test from 'node:test';
import assert from 'node:assert/strict';
import { convertDoseToRate, convertRateToDose } from '../utils/flowConversion.js';

// 投与量->流量の換算テスト
// 例: 50kg の患者に 0.1µg/kg/min 投与する場合
// 濃度 100µg/ml のため期待される流量は 3ml/hr

test('convert dose to rate', () => {
  const rate = convertDoseToRate(0.1, 50);
  assert.ok(Math.abs(rate - 3) < 1e-6);
});

// 流量->投与量の換算テスト
// 上記と逆の計算を行い、0.1µg/kg/min が得られるか確認

test('convert rate to dose', () => {
  const dose = convertRateToDose(3, 50);
  assert.ok(Math.abs(dose - 0.1) < 1e-6);
});

// 体重が 0 の場合は NaN になることを確認
test('zero weight returns NaN', () => {
  assert.ok(Number.isNaN(convertDoseToRate(0.1, 0)));
  assert.ok(Number.isNaN(convertRateToDose(3, 0)));
});

// 体重が負の場合も NaN
test('negative weight returns NaN', () => {
  assert.ok(Number.isNaN(convertDoseToRate(0.1, -5)));
  assert.ok(Number.isNaN(convertRateToDose(3, -5)));
});

