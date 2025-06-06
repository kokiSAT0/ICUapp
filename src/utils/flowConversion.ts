// 流量換算に関する計算関数
// 複数の昇圧薬に対応するための計算関数

// 濃度計算に利用する型定義
import { SoluteUnit } from '../types';

// デフォルトの溶質量と溶液量
import { DRUGS, DrugType } from '../config/drugs';

// デフォルト薬剤(初期画面に表示する薬剤)のキー
const DEFAULT_DRUG: DrugType = 'norepinephrine';

// 設定ファイルからデフォルト値を取得
export const DEFAULT_SOLUTE_AMOUNT = DRUGS[DEFAULT_DRUG].soluteAmount;
export const DEFAULT_SOLUTE_UNIT: SoluteUnit = DRUGS[DEFAULT_DRUG].soluteUnit;
export const DEFAULT_SOLUTION_VOLUME = DRUGS[DEFAULT_DRUG].solutionVolume;

/**
 * 溶質量・単位・溶液量を一行の文字列にまとめる
 * 例: 5 mg / 50 ml
 * @param {number} amount - 溶質量
 * @param {SoluteUnit} unit - 溶質量の単位
 * @param {number} volume - 溶液量(ml)
 * @returns {string} 組成を表す文字列
 */
export function formatComposition(
  amount: number,
  unit: SoluteUnit,
  volume: number,
): string {
  return `${amount} ${unit} / ${volume} ml`;
}

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

// DrugType と DRUGS は設定ファイルから再エクスポート
export type { DrugType } from '../config/drugs';
export { DRUGS } from '../config/drugs';

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
