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
  "propofol",
  "rocuronium",
  "dobutamine",
  "nicardipine",
  "nitroglycerin",
  "phenylephrine",
  "milrinone",
  "landiolol",
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
    initialDose: 1, // 推奨初期設定：1 µg/kg/hr
    soluteAmount: 1000, // 1 mg（=1000 µg）を
    soluteUnit: "µg", //
    solutionVolume: 100, // 100 mL で調製
    doseMin: 0,
    doseMax: 6, // ガイドライン上の上限 5 µg/kg/hr を少し余裕を見て
    dangerDose: 4, // 4 µg/kg/hr 超で警告表示
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
    initialDose: 0.25, // 推奨初期設定：0.25 µg/kg/min
    soluteAmount: 2, // 2 mg を（添付製剤 2 mg/バイアルを）
    soluteUnit: "mg",
    solutionVolume: 20, // 20 mL シリンジで調製（100 µg/mL）
    doseMin: 0,
    doseMax: 1, // 実臨床では 0.05〜1 µg/kg/min が多い
    dangerDose: 0.8,
    doseStep: 0.01,
    rateStep: 0.1,
    description:
      "全身麻酔維持には0.25〜0.5 µg/kg/minで開始し、循環動態に応じて0.05〜1 µg/kg/minの範囲で調節する。投与中止後は速やかに効果が消失するため、終了前に術後鎮痛薬を準備する。日本麻酔科学会医薬品ガイドライン第3版4訂より。", // :contentReference[oaicite:1]{index=1}
    enabled: true,
  },
  /* ──── 1. プロポフォール（1 %＝10 mg/mL 原液） ──── */
  propofol: {
    label: "プロポフォール",
    doseUnit: "mg/kg/hr",
    initialDose: 4, // 全身麻酔維持の推奨開始速度 4 mg/kg/hr :contentReference[oaicite:0]{index=0}
    soluteAmount: 500, // 50 mL シリンジに原液を充填（10 mg/mL × 50 mL）
    soluteUnit: "mg",
    solutionVolume: 50, // mL
    doseMin: 0.5, // ICU 鎮静 0.5 mg/kg/hr から使用可 :contentReference[oaicite:1]{index=1}
    doseMax: 10, // 麻酔維持上限 10 mg/kg/hr :contentReference[oaicite:2]{index=2}
    dangerDose: 8, // 8 mg/kg/hr 超で警告
    doseStep: 0.1,
    rateStep: 0.1,
    description:
      "全身麻酔維持では通常 4–10 mg/kg/hr の範囲で調節する。人工呼吸管理下の ICU 鎮静では 0.5–3 mg/kg/hr が目安。血圧低下・呼吸抑制に十分注意し、5 分毎の血圧監視とSpO₂連続監視を行う。", //
    enabled: true,
  },

  /* ──── 2. ロクロニウム（10 mg/mL 原液） ──── */
  rocuronium: {
    label: "ロクロニウム",
    doseUnit: "µg/kg/min",
    initialDose: 7, // ガイドライン推奨の開始速度 7 µg/kg/min :contentReference[oaicite:3]{index=3}
    soluteAmount: 500, // 50 mL シリンジに原液を充填（10 mg/mL × 50 mL）
    soluteUnit: "mg",
    solutionVolume: 50, // mL
    doseMin: 3,
    doseMax: 16, // 文献上の臨床最大 16 µg/kg/min（迅速導入後の補正を考慮） :contentReference[oaicite:4]{index=4}
    dangerDose: 12,
    doseStep: 0.5,
    rateStep: 0.1,
    description:
      "持続注入は 7 µg/kg/min で開始し、筋弛緩モニター（TOF, PTC）を参考に 3–16 µg/kg/min で調節する。深筋弛緩の維持時は高用量となり循環抑制に留意。拮抗にはスガマデクスが第一選択。", //
    enabled: true,
  },
  /* ──── 1. ドブタミン ──── */
  dobutamine: {
    label: "ドブタミン",
    doseUnit: "µg/kg/min",
    initialDose: 5, // 標準開始 5 µg/kg/min :contentReference[oaicite:0]{index=0}
    soluteAmount: 250, // 250 mg
    soluteUnit: "mg",
    solutionVolume: 50, // 50 mL（5 mg/mL）
    doseMin: 2,
    doseMax: 20,
    dangerDose: 15,
    doseStep: 0.5,
    rateStep: 0.1,
    description:
      "強心作用により心拍出量を増加させる。2–20 µg/kg/min の範囲で循環動態に応じて調節する。高用量では頻脈・不整脈に注意。", // :contentReference[oaicite:1]{index=1}
    enabled: true,
  },

  /* ──── 2. ニカルジピン ──── */
  nicardipine: {
    label: "ニカルジピン",
    doseUnit: "mg/hr",
    initialDose: 5, // 5 mg/hr で開始 :contentReference[oaicite:2]{index=2}
    soluteAmount: 25, // 25 mg
    soluteUnit: "mg",
    solutionVolume: 25, // 25 mL（1 mg/mL 原液）
    doseMin: 2.5,
    doseMax: 15,
    dangerDose: 10,
    doseStep: 0.5,
    rateStep: 0.1,
    description:
      "持続血圧管理の第一選択Ca拮抗薬。5 mg/hr から開始し、2.5 mg/hr ごとに5–15分間隔で増量。末梢投与の場合は12 時間毎にルート変更。", // :contentReference[oaicite:3]{index=3}
    enabled: true,
  },

  /* ──── 3. ニトログリセリン ──── */
  nitroglycerin: {
    label: "ニトログリセリン",
    doseUnit: "µg/kg/min",
    initialDose: 0.5, // 0.25–0.5 µg/kg/min で開始 :contentReference[oaicite:4]{index=4}
    soluteAmount: 50, // 50 mg
    soluteUnit: "mg",
    solutionVolume: 50, // 50 mL（1 mg/mL）
    doseMin: 0.25,
    doseMax: 5,
    dangerDose: 3,
    doseStep: 0.05,
    rateStep: 0.1,
    description:
      "前負荷軽減・冠血流増加目的に用いる。0.25–5 µg/kg/min の範囲で3–5 分毎に漸増し、血圧低下・頭痛に注意。", // :contentReference[oaicite:5]{index=5}
    enabled: true,
  },

  /* ──── 4. フェニレフリン ──── */
  phenylephrine: {
    label: "フェニレフリン",
    doseUnit: "µg/kg/min",
    initialDose: 0.5, // 0.5–1.4 µg/kg/min 維持 :contentReference[oaicite:6]{index=6}
    soluteAmount: 10, // 10 mg
    soluteUnit: "mg",
    solutionVolume: 50, // 50 mL（200 µg/mL）
    doseMin: 0.1,
    doseMax: 3,
    dangerDose: 2,
    doseStep: 0.05,
    rateStep: 0.1,
    description:
      "純α刺激で血圧を上げる。0.1–3 µg/kg/min を目安に、過大投与では末梢虚血や反射性徐脈に注意。", // :contentReference[oaicite:7]{index=7}
    enabled: true,
  },

  /* ──── 5. ミルリノン ──── */
  milrinone: {
    label: "ミルリノン",
    doseUnit: "µg/kg/min",
    initialDose: 0.375, // 0.375 µg/kg/min 開始 :contentReference[oaicite:8]{index=8}
    soluteAmount: 50, // 50 mg
    soluteUnit: "mg",
    solutionVolume: 50, // 50 mL（1 mg/mL）
    doseMin: 0.25,
    doseMax: 1,
    dangerDose: 0.75,
    doseStep: 0.05,
    rateStep: 0.1,
    description:
      "PDEⅢ阻害による強心・血管拡張薬。0.25–0.75 µg/kg/min で心拍出量と末梢抵抗を調節。低血圧・不整脈に注意し、腎機能で用量調整が必要。", // :contentReference[oaicite:9]{index=9}
    enabled: true,
  },

  /* ──── 6. ランジオロール ──── */
  landiolol: {
    label: "ランジオロール",
    doseUnit: "µg/kg/min",
    initialDose: 3, // 1–10 µg/kg/min から開始例が多い :contentReference[oaicite:10]{index=10}
    soluteAmount: 300, // 300 mg
    soluteUnit: "mg",
    solutionVolume: 50, // 50 mL（6 mg/mL）
    doseMin: 1,
    doseMax: 40,
    dangerDose: 20,
    doseStep: 0.5,
    rateStep: 0.1,
    description:
      "超短時間作用型β₁遮断薬。頻拍性不整脈や心拍数コントロールに用い、1–40 µg/kg/min の範囲で titrate。過度の徐脈・低血圧に注意し、効果消失は投与中止後約4分。", // :contentReference[oaicite:11]{index=11}
    enabled: true,
  },
};
