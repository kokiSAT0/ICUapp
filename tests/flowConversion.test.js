// Jest でテストを実行する
import { createRequire } from 'module';

// ES モジュール内で CommonJS の require を使うためのユーティリティ
const require = createRequire(import.meta.url);
require('sucrase/register/ts.js');
const {
  convertDoseToRate,
  convertRateToDose,
  DEFAULT_CONCENTRATION,
  formatComposition,
} = require('../src/utils/flowConversion.ts');
const { DRUGS } = require('../src/config/drugs');

describe('flowConversion utilities', () => {
  test('dose-rate roundtrip', () => {
    const rate = convertDoseToRate(0.03, 50, DEFAULT_CONCENTRATION);
    expect(Math.abs(rate - 0.9)).toBeLessThan(1e-6);
    const dose = convertRateToDose(rate, 50, DEFAULT_CONCENTRATION);
    expect(Math.abs(dose - 0.03)).toBeLessThan(1e-6);
  });

  test('format composition string', () => {
    const result = formatComposition(5, 'mg', 50);
    expect(result).toBe('5 mg / 50 ml');
  });

  test('dexmedetomidine config', () => {
    expect(DRUGS.dexmedetomidine.doseUnit).toBe('µg/kg/hr');
    expect(DRUGS.dexmedetomidine.initialDose).toBe(0.2);
  });
});
