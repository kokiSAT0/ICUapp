// 流量換算に関する計算関数
// 複数の昇圧薬に対応するための計算関数

// 濃度計算に利用する型定義
export type SoluteUnit = 'mg' | 'µg';

// デフォルトの溶質量と溶液量
export const DEFAULT_SOLUTE_AMOUNT = 5;
export const DEFAULT_SOLUTE_UNIT: SoluteUnit = 'mg';
export const DEFAULT_SOLUTION_VOLUME = 50;

/**
 * 溶質量と溶液量から濃度(µg/ml)を計算
 * @param {number} amount - 溶質量
 * @param {SoluteUnit} unit - 溶質量の単位
 * @param {number} volume - 溶液量(ml)
 * @returns {number} µg/ml
 */
export function computeConcentration(
  amount: number,
  unit: SoluteUnit,
  volume: number,
): number {
  if (volume <= 0) {
    return NaN;
  }
  const ug = unit === 'mg' ? amount * 1000 : amount;
  return ug / volume;
}

// デフォルト濃度を計算して定数化
export const DEFAULT_CONCENTRATION = computeConcentration(
  DEFAULT_SOLUTE_AMOUNT,
  DEFAULT_SOLUTE_UNIT,
  DEFAULT_SOLUTION_VOLUME,
);

// 薬剤ごとのデフォルト値をまとめた型
export type DrugType = 'norepinephrine' | 'dopamine';

export type DrugInfo = {
  // 画面に表示する日本語名称
  label: string;
  soluteAmount: number;
  soluteUnit: SoluteUnit;
  solutionVolume: number;
  doseMin: number;
  doseMax: number;
};

// 対応する薬剤リスト
export const DRUGS: Record<DrugType, DrugInfo> = {
  norepinephrine: {
    label: 'ノルアドレナリン',
    soluteAmount: 5,
    soluteUnit: 'mg',
    solutionVolume: 50,
    doseMin: 0,
    doseMax: 0.3,
  },
  dopamine: {
    label: 'ドパミン',
    soluteAmount: 600,
    soluteUnit: 'mg',
    solutionVolume: 200,
    doseMin: 0,
    doseMax: 20,
  },
};

/**
 * 投与量(µg/kg/min)から流量(ml/hr)を計算します
 * @param {number} dose - 投与量(µg/kg/min)
 * @param {number} weight - 体重(kg)
 * @returns {number} ml/hr
 */
/**
 * 投与量(µg/kg/min)から流量(ml/hr)を計算
 * dose: 投与量, weight: 体重
 */
export function convertDoseToRate(
  dose: number,
  weight: number,
  concentration: number,
): number {
  // 体重が 0 以下なら計算できない

  if (weight <= 0) {
    return NaN;
  }
  const ugPerMin = dose * weight; // 体重を掛けて µg/min へ
  const ugPerHour = ugPerMin * 60; // 60分を掛けて µg/hr へ
  // 濃度(µg/ml)で割って ml/hr を算出
  return ugPerHour / concentration;
}

/**
 * 流量(ml/hr)から投与量(µg/kg/min)を計算します
 * @param {number} rate - 流量(ml/hr)
 * @param {number} weight - 体重(kg)
 * @returns {number} µg/kg/min
 */
/**
 * 流量(ml/hr)から投与量(µg/kg/min)を計算
 * rate: 流量, weight: 体重
 */
export function convertRateToDose(
  rate: number,
  weight: number,
  concentration: number,
): number {
  // 体重が 0 以下なら計算できない
  if (weight <= 0) {
    return NaN;
  }

  const ugPerHour = rate * concentration; // ml/hr から µg/hr へ
  const ugPerMin = ugPerHour / 60; // 1時間60分で割る
  // 体重で割って µg/kg/min を算出
  return ugPerMin / weight;
}
