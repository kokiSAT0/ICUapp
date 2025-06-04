import test from 'node:test';
import assert from 'node:assert/strict';
// sucrase を使って TypeScript ファイルを読み込む設定
import 'sucrase/register/ts.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const {
  convertDoseToRate,
  convertRateToDose,
} = require('../src/utils/flowConversion.ts');

test('dose-rate roundtrip', () => {
  const rate = convertDoseToRate(0.03, 50);
  assert.ok(Math.abs(rate - 0.9) < 1e-6);
  const dose = convertRateToDose(rate, 50);
  assert.ok(Math.abs(dose - 0.03) < 1e-6);
});
