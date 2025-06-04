import test from 'node:test';
import assert from 'node:assert/strict';
import { convertDoseToRate, convertRateToDose } from '../src/utils/flowConversion.js';

test('dose-rate roundtrip', () => {
  const rate = convertDoseToRate(0.03, 50);
  assert.ok(Math.abs(rate - 0.9) < 1e-6);
  const dose = convertRateToDose(rate, 50);
  assert.ok(Math.abs(dose - 0.03) < 1e-6);
});
