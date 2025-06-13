// ここで定義した配列 DRUG_LIST に薬剤IDを追加するだけで
// アプリ全体に自動で組み込まれる仕組み。
// "as const" を付けると配列の中身を固定値として扱えるため、
// 文字列リテラル型を安全に生成できる。
export const DRUG_LIST = [
  "norepinephrine",
  "dopamine",
  "dobutamine",
  "milrinone",
  "nicardipine",
  "nitroglycerin",
  "landiolol",
  "dexmedetomidine",
  "propofol",
  "midazolam",
  "fentanyl",
  "remifentanil",
  "rocuronium",
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
    description:
      "通常0.01\uFF5E0.2µg/kg/minであるが、さらに高用量が必要なこともある。血圧を経時的に測定し、適宜調節する。(日本麻酔科学会医薬品ガイドライン第3版4訂)",
    enabled: true,
  },
  dopamine: {
    label: "ドパミン",
    doseUnit: "µg/kg/min",
    initialDose: 3,
    soluteAmount: 600,
    soluteUnit: "mg",
    solutionVolume: 200,
    doseMin: 0,
    doseMax: 20,
    dangerDose: 10,
    description:
      "循環維持を目的とした一般的な初期投与量は3\uFF5E5µg/kg/minであり、患者の心拍出量、血圧、心拍数および尿量により適宜増減する。患者の病態に応じて、最大20µg/kg/minまで増量することができるが、8\uFF5E10µg/kg/min以上では血管抵抗の上昇が強くなるので、さらなる心収縮力の増強を期待する場合は他の薬剤との併用を考慮する。(日本麻酔科学会医薬品ガイドライン第3版4訂)",
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
    description:
      "初期負荷投与は通常行わないが、実施する場合は循環動態の変動に十分注意する。維持投与速度は、0.2\uFF5E0.7µg/kg/hrを目安とするが、目的とする鎮静度を得るために、より多量を必要とする症例もある。(日本麻酔科学会医薬品ガイドライン第3版4訂)",
    enabled: true,
  },
  fentanyl: {
    label: "フェンタニル",
    doseUnit: "µg/kg/hr",
    initialDose: 1,
    soluteAmount: 1000,
    soluteUnit: "µg",
    solutionVolume: 100,
    doseMin: 0,
    doseMax: 5,
    dangerDose: 2,
    description:
      "術後痛に対しては、初回投与量として1\uFF5E2μg/kg を静注し、引き続き1\uFF5E2μg/kg/hr で持続静注する。(日本麻酔科学会医薬品ガイドライン第3版4訂)",
    enabled: true,
  },

  remifentanil: {
    label: "レミフェンタニル",
    doseUnit: "µg/kg/min",
    initialDose: 0.025,
    soluteAmount: 2,
    soluteUnit: "mg",
    solutionVolume: 20,
    doseMin: 0,
    doseMax: 0.5,
    dangerDose: 0.2,
    description:
      "集中治療における人工呼吸中の鎮痛:通常、成人には、レミフェンタニルとして0.025µg/kg/分の速さで持続静脈内投与を開始し、患者の全身状態を観察しながら、適切な鎮痛が得られるよう、投与速度を適宜調節する。投与速度の調節は5分以上の間隔で、0.1µg/kg/分までは最大0.025µg/kg/分ずつ加速又は減速させ、0.1µg/kg/分を超える場合は25\uFF5E50%の範囲で加速又は最大25%の範囲で減速させるが、投与速度の上限は0.5µg/kg/分とする。(添付文書)",
    enabled: true,
  },
  propofol: {
    label: "プロポフォール",
    doseUnit: "mg/kg/hr",
    initialDose: 1,
    soluteAmount: 500,
    soluteUnit: "mg",
    solutionVolume: 50,
    doseMin: 0,
    doseMax: 5,
    dangerDose: 3,
    description:
      "プロポフォールを用いた集中治療における人工呼吸中の鎮静量は0.5 ～3mg/kg/hr である。(日本麻酔科学会医薬品ガイドライン第3版4訂)",
    enabled: true,
  },
  rocuronium: {
    label: "ロクロニウム",
    doseUnit: "µg/kg/min",
    initialDose: 7,
    soluteAmount: 50,
    soluteUnit: "mg",
    solutionVolume: 5,
    doseMin: 3,
    doseMax: 12,
    dangerDose: 10,
    description:
      "持続注入により投与する場合は、7μg/kg/min の投与速度で持続注入を開始する。年齢、症状に応じて適宜増減する。(日本麻酔科学会医薬品ガイドライン第3版4訂)",
    enabled: true,
  },
  dobutamine: {
    label: "ドブタミン",
    doseUnit: "µg/kg/min",
    initialDose: 2,
    soluteAmount: 150,
    soluteUnit: "mg",
    solutionVolume: 50,
    doseMin: 0,
    doseMax: 20,
    dangerDose: 10,
    description:
      "初期量として2\uFF5E10μg/kg/min で投与されるが、0.5μg/kg/min で効果が発現することもある。また、必要に応じて20μg/kg/minまで増量することができる。心拍数、血圧、尿量、心拍出量などの推移をみながら増減する。(日本麻酔科学会医薬品ガイドライン第3版4訂)",
    enabled: true,
  },
  nicardipine: {
    label: "ニカルジピン",
    doseUnit: "µg/kg/min",
    initialDose: 2,
    soluteAmount: 20,
    soluteUnit: "mg",
    solutionVolume: 20,
    doseMin: 0,
    doseMax: 15,
    dangerDose: 3,
    description:
      "成人では2\uFF5E10μg/kg/minの速度で開始し、目標値まで血圧を下げ、以後、血圧を監視しながら速度を調節する。緩徐な血圧下降をはかるときは、0.5\uFF5E2μg/kg/minで開始する。維持速度は0.5\uFF5E3μg/kg/minである。(日本麻酔科学会医薬品ガイドライン第3版4訂)",
    enabled: true,
  },
  nitroglycerin: {
    label: "ニトログリセリン",
    doseUnit: "µg/kg/min",
    initialDose: 0.1,
    soluteAmount: 50,
    soluteUnit: "mg",
    solutionVolume: 100,
    doseMin: 0,
    doseMax: 5,
    dangerDose: 2,
    description:
      "不安定狭心症では0.1\uFF5E0.2μg/kg/minで開始し、発作の経過、血圧をみながら約5分ごとに0.1\uFF5E0.2μg/kg/minずつ増量し、1\uFF5E2μg/kg/minで維持する(日本麻酔科学会医薬品ガイドライン第3版4訂)",
    enabled: true,
  },
  milrinone: {
    label: "ミルリノン",
    doseUnit: "µg/kg/min",
    initialDose: 0.1,
    soluteAmount: 10,
    soluteUnit: "mg",
    solutionVolume: 10,
    doseMin: 0,
    doseMax: 0.3,
    dangerDose: 0.75,
    description:
      "高用量での血圧低下や不整脈発生などの副作用を避けるために、最近では、低用量の0.1μg/kg/min で開始し、0.2\uFF5E0.3μg/kg/minを目標とすることで症状の改善が得られるという米国のガイドラインが策定されているように、初期負荷投与を行わずに最初から持続投与を行うことが多くなっている。(日本麻酔科学会医薬品ガイドライン第3版4訂)",
    enabled: true,
  },
  landiolol: {
    label: "ランジオロール",
    doseUnit: "µg/kg/min",
    initialDose: 1,
    soluteAmount: 150,
    soluteUnit: "mg",
    solutionVolume: 50,
    doseMin: 0,
    doseMax: 20,
    dangerDose: 10,
    description:
      "循環機能が不良な患者では、最初から1\uFF5E10μg/kg/min で持続静注を開始し、循環動態監視下に投与量を調節するのがよい。(日本麻酔科学会医薬品ガイドライン第3版4訂)",
    enabled: true,
  },
  midazolam: {
    label: "ミダゾラム",
    doseUnit: "mg/kg/hr",
    initialDose: 0.03,
    soluteAmount: 10,
    soluteUnit: "mg",
    solutionVolume: 10,
    doseMin: 0,
    doseMax: 0.3,
    dangerDose: 0.18,
    description:
      "集中治療における人工呼吸中の鎮静では、通常、成人には0.03\uFF5E0.06mg/kg/hrより持続静注を開始し、患者の鎮静状態をみながら適宜増減する。（0.03\uFF5E0.18mg/kg/hr の範囲が推奨される）。(日本麻酔科学会医薬品ガイドライン第3版4訂)",
    enabled: true,
  },
};
