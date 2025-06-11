// 流量換算に関する計算関数
// 複数の昇圧薬に対応するための計算関数

// 濃度計算に利用する型定義
import { SoluteUnit } from '../types';
// Expo 環境の設定値を取得するためのモジュール
// Constants.expoConfig?.extra に app.config.js で定義した値が入る
// Expo 環境では expo-constants を利用するが、Jest 実行時は ESModules が
// 読み込めずエラーになるため try/catch で読み込みを試みる
let Constants: { expoConfig?: any } = { expoConfig: {} };
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Constants = require('expo-constants').default;
} catch {
  // テスト環境では空オブジェクトを利用する
  Constants = { expoConfig: {} };
}

// デフォルトの溶質量と溶液量
import { DRUGS, DrugType } from '../config/drugs';
import type { DoseUnit } from '../types';

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
// Expo の設定 (app.config.js の extra) から濃度を取得する
// Constants.expoConfig?.extra?.DRUG_CONCENTRATION に値があればそれを利用する
const envConc = Number(Constants.expoConfig?.extra?.DRUG_CONCENTRATION);
export const DEFAULT_CONCENTRATION = Number.isFinite(envConc)
  ? envConc
  : computeConcentration(
      DEFAULT_SOLUTE_AMOUNT,
      DEFAULT_SOLUTE_UNIT,
      DEFAULT_SOLUTION_VOLUME,
    );

// DrugType と DRUGS は設定ファイルから再エクスポート
export type { DrugType } from '../config/drugs';
export { DRUGS } from '../config/drugs';

/**
 * 投与量(µg/kg/min または µg/kg/hr)から流量(ml/hr)を計算します
 * @param {number} dose - 投与量
 * @param {number} weight - 体重(kg)
 * @param {DoseUnit} unit - 投与量の単位
 * @returns {number} ml/hr
 */
/**
 * 投与量から流量(ml/hr)を計算
 * dose: 投与量, weight: 体重
 */
export function convertDoseToRate(
  dose: number,
  weight: number,
  concentration: number,
  unit: DoseUnit,
): number {
  // 体重が 0 以下なら計算できない

  if (weight <= 0) {
    return NaN;
  }
  // 投与量の単位に応じて計算方法を分岐
  const ugPerHour =
    unit === 'µg/kg/min'
      ? dose * weight * 60 // µg/kg/min の場合は 60 分を掛ける
      : dose * weight; // µg/kg/hr はそのまま
  // 濃度(µg/ml)で割って ml/hr を算出
  return ugPerHour / concentration;
}

/**
 * 流量(ml/hr)から投与量(µg/kg/min または µg/kg/hr)を計算します
 * @param {number} rate - 流量(ml/hr)
 * @param {number} weight - 体重(kg)
 * @param {DoseUnit} unit - 投与量の単位
 * @returns {number} 投与量
 */
/**
 * 流量(ml/hr)から投与量を計算
 * rate: 流量, weight: 体重
 */
export function convertRateToDose(
  rate: number,
  weight: number,
  concentration: number,
  unit: DoseUnit,
): number {
  // 体重が 0 以下なら計算できない
  if (weight <= 0) {
    return NaN;
  }

  const ugPerHour = rate * concentration; // ml/hr から µg/hr へ
  const dosePerKg =
    unit === 'µg/kg/min'
      ? (ugPerHour / 60) / weight // µg/kg/min へ換算
      : ugPerHour / weight; // µg/kg/hr へ換算
  return dosePerKg;
}
