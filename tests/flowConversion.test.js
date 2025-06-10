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
  formatComposition,
} = require('../src/utils/flowConversion.ts');
const { DRUGS } = require('../src/config/drugs');

test('dose-rate roundtrip', () => {
  const rate = convertDoseToRate(0.03, 50, DEFAULT_CONCENTRATION);
  assert.ok(Math.abs(rate - 0.9) < 1e-6);
  const dose = convertRateToDose(rate, 50, DEFAULT_CONCENTRATION);
  assert.ok(Math.abs(dose - 0.03) < 1e-6);
});

test('format composition string', () => {
  const result = formatComposition(5, 'mg', 50);
  assert.strictEqual(result, '5 mg / 50 ml');
});

test('dexmedetomidine config', () => {
  assert.strictEqual(DRUGS.dexmedetomidine.doseUnit, 'µg/kg/hr');
  assert.strictEqual(DRUGS.dexmedetomidine.initialDose, 0.2);
});
