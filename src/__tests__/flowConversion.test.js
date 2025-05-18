import { convertDoseToRate, convertRateToDose } from '../utils/flowConversion';

// 投与量->流量の換算テスト
// 例: 50kg の患者に 0.1µg/kg/min 投与する場合
// 濃度 100µg/ml のため期待される流量は 3ml/hr

test('convert dose to rate', () => {
  const rate = convertDoseToRate(0.1, 50);
  expect(rate).toBeCloseTo(3);
});

// 流量->投与量の換算テスト
// 上記と逆の計算を行い、0.1µg/kg/min が得られるか確認

test('convert rate to dose', () => {
  const dose = convertRateToDose(3, 50);
  expect(dose).toBeCloseTo(0.1);
});

// 体重が 0 の場合は NaN になることを確認
test('zero weight returns NaN', () => {
  expect(convertDoseToRate(0.1, 0)).toBeNaN();
  expect(convertRateToDose(3, 0)).toBeNaN();
});

// 体重が負の場合も NaN
test('negative weight returns NaN', () => {
  expect(convertDoseToRate(0.1, -5)).toBeNaN();
  expect(convertRateToDose(3, -5)).toBeNaN();
});

