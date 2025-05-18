// 流量換算に関する計算関数
// ノルアドレナリン(2mg/20ml)のみを対象とする簡易版です

// 濃度: 2mg/20ml = 2000µg/20ml = 100µg/ml
const CONCENTRATION_UG_PER_ML = 100;

/**
 * 投与量(µg/kg/min)から流量(ml/hr)を計算します
 * @param {number} dose - 投与量(µg/kg/min)
 * @param {number} weight - 体重(kg)
 * @returns {number} ml/hr
 */
export function convertDoseToRate(dose, weight) {
  // 体重が 0 以下なら計算できない
  if (weight <= 0) {
    return NaN;
  }
  const ugPerMin = dose * weight; // 体重を掛けて µg/min へ
  const ugPerHour = ugPerMin * 60; // 60分を掛けて µg/hr へ
  // 濃度(µg/ml)で割って ml/hr を算出
  return ugPerHour / CONCENTRATION_UG_PER_ML;
}

/**
 * 流量(ml/hr)から投与量(µg/kg/min)を計算します
 * @param {number} rate - 流量(ml/hr)
 * @param {number} weight - 体重(kg)
 * @returns {number} µg/kg/min
 */
export function convertRateToDose(rate, weight) {
  // 体重が 0 以下なら計算できない
  if (weight <= 0) {
    return NaN;
  }
  const ugPerHour = rate * CONCENTRATION_UG_PER_ML; // ml/hr から µg/hr へ
  const ugPerMin = ugPerHour / 60; // 1時間60分で割る
  // 体重で割って µg/kg/min を算出
  return ugPerMin / weight;
}
