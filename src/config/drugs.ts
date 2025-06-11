// ここで定義した配列 DRUG_LIST に薬剤IDを追加するだけで
// アプリ全体に自動で組み込まれる仕組み。
// "as const" を付けると配列の中身を固定値として扱えるため、
// 文字列リテラル型を安全に生成できる。
export const DRUG_LIST = [
  "norepinephrine",
  "dopamine",
  "dexmedetomidine",
  "fentanyl",
  "remifentanil",
] as const;

// DRUG_LIST の要素を使って型を生成
export type DrugType = (typeof DRUG_LIST)[number];

import { SoluteUnit, DoseUnit } from "../types";

export type DrugConfig = {
  // 画面表示用ラベル
  label: string;
  // 初期投与量
  initialDose: number;
  // 投与量の単位
  doseUnit: DoseUnit;
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
  // 表示対象とするか
  enabled: boolean;
};

export const DRUGS: Record<DrugType, DrugConfig> = {
  norepinephrine: {
    label: "ノルアドレナリン",
    doseUnit: "µg/kg/min",
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
    enabled: true,
  },
  dopamine: {
    label: "ドパミン",
    doseUnit: "µg/kg/min",
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
    enabled: true,
  },
  dexmedetomidine: {
    label: "デクスメデトミジン",
    doseUnit: "µg/kg/hr",
    initialDose: 0.2,
    soluteAmount: 200,
    soluteUnit: "µg",
    solutionVolume: 50,
    doseMin: 0,
    doseMax: 1.2,
    dangerDose: 0.7,
    doseStep: 0.01,
    rateStep: 0.1,
    description:
      "初期負荷投与は通常行わないが，実施する場合は循環動態の変動に十分注意する．維持投与速度は，0.2\uFF5E0.7µg/kg/hrを目安とするが，目的とする鎮静度を得るために，より多量を必要とする症例もある．(日本麻酔科学会医薬品ガイドライン第3版4訂)",
    enabled: true,
  },
  fentanyl: {
    label: "フェンタニル",
    // ICU・術後鎮痛で一般的に用いられる体重当たり投与速度
    doseUnit: "µg/kg/hr",
    initialDose: 1,          // 推奨初期設定：1 µg/kg/hr
    soluteAmount: 1000,      // 1 mg（=1000 µg）を
    soluteUnit: "µg",        // 
    solutionVolume: 100,      // 100 mL で調製
    doseMin: 0,
    doseMax: 6,              // ガイドライン上の上限 5 µg/kg/hr を少し余裕を見て
    dangerDose: 4,           // 4 µg/kg/hr 超で警告表示
    doseStep: 0.1,
    rateStep: 0.1,
    description:
      "術後鎮痛では通常1〜2 µg/kg/hrで開始し、呼吸抑制・徐脈に注意しながら0.5〜5 µg/kg/hrで調節する。大量投与では胸壁筋硬直が起こり得る。日本麻酔科学会医薬品ガイドライン第3版4訂より。", // :contentReference[oaicite:0]{index=0}
    enabled: true,
  },

  remifentanil: {
    label: "レミフェンタニル",
    // 全身麻酔維持で用いる投与速度
    doseUnit: "µg/kg/min",
    initialDose: 0.25,       // 推奨初期設定：0.25 µg/kg/min
    soluteAmount: 2,         // 2 mg を（添付製剤 2 mg/バイアルを）
    soluteUnit: "mg",
    solutionVolume: 20,      // 20 mL シリンジで調製（100 µg/mL）
    doseMin: 0,
    doseMax: 1,              // 実臨床では 0.05〜1 µg/kg/min が多い
    dangerDose: 0.8,
    doseStep: 0.01,
    rateStep: 0.1,
    description:
      "全身麻酔維持には0.25〜0.5 µg/kg/minで開始し、循環動態に応じて0.05〜1 µg/kg/minの範囲で調節する。投与中止後は速やかに効果が消失するため、終了前に術後鎮痛薬を準備する。日本麻酔科学会医薬品ガイドライン第3版4訂より。", // :contentReference[oaicite:1]{index=1}
    enabled: true,
  },
};
