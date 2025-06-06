export type DrugType = "norepinephrine" | "dopamine";

import { SoluteUnit } from "../types";

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
  // 薬剤の説明文
  description: string;
};

export const DRUGS: Record<DrugType, DrugConfig> = {
  norepinephrine: {
    label: "ノルアドレナリン",
    initialDose: 0.03,
    soluteAmount: 5,
    soluteUnit: "mg",
    solutionVolume: 50,
    doseMin: 0,
    doseMax: 0.3,
    dangerDose: 0.2,
    doseStep: 0.01,
    rateStep: 0.1,
    description:
      "通常0.01\uFF5E0.2µg/kg/minであるが，さらに高用量が必要なこともある．血圧を経時的に測定し，適宜調節する．(日本麻酔科学会医薬品ガイドライン第3版4訂)",
  },
  dopamine: {
    label: "ドパミン",
    initialDose: 5,
    soluteAmount: 600,
    soluteUnit: "mg",
    solutionVolume: 200,
    doseMin: 0,
    doseMax: 20,
    dangerDose: 15,
    doseStep: 0.1,
    rateStep: 1,
    description:
      "循環維持を目的とした一般的な初期投与量は3\uFF5E5µg/kg/minであり，患者の心拍出量，血圧，心拍数および尿量により適宜増減する．患者の病態に応じて，最大20µg/kg/minまで増量することができるが，8\uFF5E10µg/kg/min以上では血管抵抗の上昇が強くなるので，さらなる心収縮力の増強を期待する場合は他の薬剤との併用を考慮する．(日本麻酔科学会医薬品ガイドライン第3版4訂)",
  },
};
