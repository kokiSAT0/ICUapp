export type DrugType = 'norepinephrine' | 'dopamine';

import { SoluteUnit } from '../types';

export type DrugConfig = {
  // 画面表示用ラベル
  label: string;
  // 初期投与量(µg/kg/min)
  initialDose: number;
  soluteAmount: number;
  soluteUnit: SoluteUnit;
  solutionVolume: number;
  doseMin: number;
  doseMax: number;
  dangerDose?: number;
  // 投与量スライダーの刻み幅
  doseStep: number;
  // 流量スライダーの刻み幅
  rateStep: number;
};

export const DRUGS: Record<DrugType, DrugConfig> = {
  norepinephrine: {
    label: 'ノルアドレナリン',
    initialDose: 0.03,
    soluteAmount: 5,
    soluteUnit: 'mg',
    solutionVolume: 50,
    doseMin: 0,
    doseMax: 0.3,
    dangerDose: 0.2,
    doseStep: 0.01,
    rateStep: 0.1,
  },
  dopamine: {
    label: 'ドパミン',
    initialDose: 5,
    soluteAmount: 600,
    soluteUnit: 'mg',
    solutionVolume: 200,
    doseMin: 0,
    doseMax: 20,
    dangerDose: 15,
    doseStep: 0.1,
    rateStep: 1,
  },
};
