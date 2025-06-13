import React, { useState, useCallback, useMemo, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Surface, Text, Divider, Menu } from "react-native-paper";
import Slider from "@react-native-community/slider";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import DigitalNumber from "@/components/DigitalNumber";
import { IconButton } from "react-native-paper";
import CompositionDialog from "@/components/CompositionDialog";
import DrugConfigSnackbar from "@/components/DrugConfigSnackbar";

import { DIGIT_SPACING } from "@/components/DigitalNumber"; // ← 追加
// ────────────────────────────────────────────────
// 流量・投与量表示を “中央基準から” 左にずらすオフセット(%)
// ────────────────────────────────────────────────
import { Dimensions } from "react-native";

const WINDOW_WIDTH = Dimensions.get('window').width;
export const DISPLAY_SHIFT = -WINDOW_WIDTH * 0.1;

import {
  convertDoseToRate,
  convertRateToDose,
  computeConcentration,
} from "@/utils/flowConversion";
import { useDrugConfigs } from "@/contexts/DrugConfigContext";

export type GammaCalculatorScreenProps = {};
export default function GammaCalculatorScreen(_: GammaCalculatorScreenProps) {
  const insets = useSafeAreaInsets();
  // useNavigation を用いて設定画面へ遷移する
  const navigation = useNavigation<any>();
  // DrugConfigContext から設定値を取得
  const { configs, initialDrug, setInitialDrug, drugOrder } = useDrugConfigs();
  const drug = configs[initialDrug];
  // 溶質量の単位に依存するためコメントでは doseMg としているが実際は mg とは限らない
  const [doseMg, setDoseMg] = useState(drug.soluteAmount);
  const [volumeMl, setVolumeMl] = useState(drug.solutionVolume);

  /* ===== 画面状態 ===== */
  const [weightKg, setWeightKg] = useState(60);
  // 値編集ダイアログの表示状態
  const [dialogVisible, setDialogVisible] = useState(false);
  // 薬剤選択メニューの表示状態
  const [drugMenuVisible, setDrugMenuVisible] = useState(false);
  // 初期濃度から流量を計算
  const initialConc = computeConcentration(doseMg, drug.soluteUnit, volumeMl);
  const [flowMlH, setFlowMlH] = useState(
    convertDoseToRate(drug.initialDose, weightKg, initialConc, drug.doseUnit)
  );
  const [dose, setDose] = useState(drug.initialDose);
  // スライダーの上限
  const doseMax = drug.doseMax;
  const showDanger = drug.dangerDose !== undefined && dose >= drug.dangerDose;

  /* ---- 安全域 / 危険域の幅割合を算出 ---- */
  const dangerRatio = drug.dangerDose
    ? (doseMax - drug.dangerDose) / doseMax          // 0〜1
    : 0;                                             // dangerDose 未設定なら赤無し
  const safeRatio = 1 - dangerRatio;                 // 緑側の割合

  /* === 各桁ごとのインクリメント / デクリメント === */
  // ml/h : 4 桁（100, 10, 1, 0.1）
  const flowSteps = [100, 10, 1, 0.1];
  // 投与量 : 4 桁（10, 1, 0.1, 0.01）
  const doseSteps = [10, 1, 0.1, 0.01];

  // 濃度(µg/ml)を都度計算する。useMemo で不要な再計算を避ける
  const concentration = useMemo(
    () => computeConcentration(doseMg, drug.soluteUnit, volumeMl),
    [doseMg, volumeMl, drug.soluteUnit]
  );

  // ───────────────────────────────────────
  // dangerDose → ml/h 換算値を計算
  // ───────────────────────────────────────
  const dangerDoseVal = drug.dangerDose;   // 高容量閾値 (μg/kg/min 等)
  const dangerFlowMlH = useMemo(() => {
    if (dangerDoseVal === undefined) return null;
    return convertDoseToRate(
      dangerDoseVal,
      weightKg,
      concentration,
      drug.doseUnit
    );
  }, [dangerDoseVal, weightKg, concentration, drug.doseUnit]);

  // スライダー刻み幅：流量 0.1 ml/h 分の投与量に変換
  const doseSliderStep = useMemo(
    () => convertRateToDose(0.1, weightKg, concentration, drug.doseUnit),
    [weightKg, concentration, drug.doseUnit]
  );

  /** ml/h 変更時に投与量を自動更新する */
  const updateFromFlow = (value: number): void => {
    const flow = Math.max(0, +value.toFixed(1));
    setFlowMlH(flow);
    const d = convertRateToDose(flow, weightKg, concentration, drug.doseUnit);
    setDose(+d.toFixed(2));
  };

  /** 投与量変更時に ml/h を自動更新する */
  const updateFromDose = (value: number): void => {
    const d = Math.max(0, +value.toFixed(2));
    setDose(d);
    const flow = convertDoseToRate(d, weightKg, concentration, drug.doseUnit);
    setFlowMlH(+flow.toFixed(1));
  };

  const incFlow = (idx: number) => updateFromFlow(flowMlH + flowSteps[idx]);
  const decFlow = (idx: number) => updateFromFlow(flowMlH - flowSteps[idx]);
  const incDose = (idx: number) => updateFromDose(dose + doseSteps[idx]);
  const decDose = (idx: number) => updateFromDose(dose - doseSteps[idx]);

  // メニューで薬剤を選択したときの処理
  const handleSelectDrug = async (drugId: keyof typeof configs) => {
    // 選択された薬剤の設定を取得
    const next = configs[drugId];
    // 数値表示とスライダーがずれないよう先に各値を更新
    setDoseMg(next.soluteAmount);
    setVolumeMl(next.solutionVolume);
    setDose(next.initialDose);
    const conc = computeConcentration(
      next.soluteAmount,
      next.soluteUnit,
      next.solutionVolume
    );
    const flow = convertDoseToRate(
      next.initialDose,
      weightKg,
      conc,
      next.doseUnit
    );
    setFlowMlH(+flow.toFixed(1));

    // 表示薬剤を切り替えたあとでメニューを閉じる
    await setInitialDrug(drugId);
    setDrugMenuVisible(false);
  };

  // ダイアログで保存された値を反映
  const handleSubmitValues = useCallback(
    (dose: number, volume: number, weight: number) => {
      setDoseMg(dose);
      setVolumeMl(volume);
      setWeightKg(weight);
      // 組成や体重が変わったら流量を基準に投与量を計算し直す
      const conc = computeConcentration(dose, drug.soluteUnit, volume);
      const d = convertRateToDose(flowMlH, weight, conc, drug.doseUnit);
      setDose(+d.toFixed(2));
    },
    [flowMlH]
  );

  // 選択薬剤が変わったら各値を初期設定に更新
  useEffect(() => {
    const next = configs[initialDrug];
    setDoseMg(next.soluteAmount);
    setVolumeMl(next.solutionVolume);
    setDose(next.initialDose);
    const conc = computeConcentration(
      next.soluteAmount,
      next.soluteUnit,
      next.solutionVolume
    );
    const flow = convertDoseToRate(
      next.initialDose,
      weightKg,
      conc,
      next.doseUnit
    );
    setFlowMlH(+flow.toFixed(1));
  }, [initialDrug, configs, weightKg]);

  // 組成や体重が変化したときは現在の流量から投与量を再計算する
  useEffect(() => {
    const d = convertRateToDose(
      flowMlH,
      weightKg,
      concentration,
      drug.doseUnit
    );
    setDose(+d.toFixed(2));
  }, [concentration, weightKg]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        style={{ flex: 1 }}
      >
        {/* ===== Header ===== */}
        <View style={styles.header}>
          {/* 中央：幅 80 % の薬剤名ボタン（Menu の anchor） */}
          <Menu
            visible={drugMenuVisible}
            onDismiss={() => setDrugMenuVisible(false)}
            anchor={
              <Pressable
                style={styles.centerButton}
                onPress={() => setDrugMenuVisible(true)}
              >
                <Text variant="titleMedium" style={{fontSize: 18, fontWeight: "normal" }}>
                  {drug.label}
                </Text>
              </Pressable>
            }
          >
            {drugOrder
              .filter((d) => configs[d].enabled)
              .map((d) => (
                <Menu.Item
                  key={d}
                  onPress={() => handleSelectDrug(d)}
                  title={configs[d].label}
                />
              ))}
          </Menu>

          {/* 右側：設定アイコン（IconButton に置換） */}
          <IconButton
            icon="cog"              // ← ここをお好みのアイコン名に
            size={28}                // 適宜調整
            style={styles.settingBtn}
            onPress={() => navigation.navigate("Settings")}
          />
        </View>
        <Divider bold style={{ height: 1 }} />

        {/* ===== ① 組成 / 体重 ===== */}
        <Pressable onPress={() => setDialogVisible(true)} style={{ marginHorizontal: 8 }}>
          <Surface elevation={1} style={styles.infoCard}>
            <Text style={styles.infoText}>組成 :</Text>
            <Text style={[styles.infoText, styles.valueBox]}>{doseMg}</Text>
            <Text style={styles.infoText}> {drug.soluteUnit} / </Text>
            <Text style={[styles.infoText, styles.valueBox]}>{volumeMl}</Text>
            <Text style={styles.infoText}> ml </Text>
            <Text style={[styles.infoText, styles.concText]}>
              ({concentration.toFixed(0)} µg/ml)
            </Text>
            <Text style={styles.infoText}>　体重 </Text>
            <Text style={[styles.infoText, styles.valueBox]}>{weightKg}</Text>
            <Text style={styles.infoText}> kg</Text>
          </Surface>
        </Pressable>

        {/* ===== ② 流量 (ml/h) ===== */}
        <Surface elevation={2} style={styles.flowCardBlue}>
          {/* ▲ 上段：4 桁ぶん */}
          <View style={styles.arrowRowTop}>
            {flowSteps.map((_, i) => (
              <View key={i} style={styles.arrowCell}>
                <IconButton
                  icon="chevron-up"
                  size={22}
                  onPress={() => incFlow(i)}
                />
              </View>
            ))}
          </View>

          {/* デジタル数字＋単位を灰色ボックス内に表示 */}
          <View style={styles.displayBox}>
            {/* ml/h は「3 整数桁 + 1 小数桁」= 4 桁固定 */}
            <View style={styles.numberWrapper}>
              <DigitalNumber value={flowMlH} intDigits={3} fracDigits={1} />
            </View>
            <Text style={styles.unitInside}>ml/h</Text>
          </View>

          {/* ▼ 下段：4 桁ぶん */}
          <View style={styles.arrowRowBottom}>
            {flowSteps.map((_, i) => (
              <View key={i} style={styles.arrowCell}>
                <IconButton
                  icon="chevron-down"
                  size={22}
                  onPress={() => decFlow(i)}
                />
              </View>
            ))}
          </View>
        </Surface>

        {/* ===== ③ 投与量 ===== */}
          <Surface
            elevation={2}
            style={[
              styles.flowCardGreen,
              showDanger && styles.flowCardDanger,      // ★ 背景色を上書き
            ]}
          >
          {/* ▲ 上段：3 桁ぶん */}
          <View style={styles.arrowRowTop}>
            {doseSteps.map((_, i) => (
              <View key={i} style={styles.arrowCell}>
                <IconButton
                  icon="chevron-up"
                  size={22}
                  onPress={() => incDose(i)}
                />
              </View>
            ))}
          </View>

          {/* デジタル数字＋単位を灰色ボックス内に表示 */}
          <View style={styles.displayBox}>
            {/* 投与量は「2 整数桁 + 2 小数桁」= 4 桁固定 */}
            <View style={styles.numberWrapper}>
              <DigitalNumber value={dose} intDigits={2} fracDigits={2} />
            </View>
            <Text style={styles.unitInside}>{drug.doseUnit}</Text>
          </View>
          {/* ▼ 下段：3 桁ぶん */}
          <View style={styles.arrowRowBelow}>
            {doseSteps.map((_, i) => (
              <View key={i} style={styles.arrowCell}>
                <IconButton
                  icon="chevron-down"
                  size={22}
                  onPress={() => decDose(i)}
                />
              </View>
            ))}
          </View>

          {/* スライダー（固定位置） */}
          <View style={styles.sliderContainer}>
            {/* ---- 安全域(緑) + 危険域(赤) の 2 色バー ---- */}
            <View pointerEvents="none" style={styles.trackOverlay}>
              <View style={[styles.safeBar,   { flexGrow: safeRatio }]} />
              <View style={[styles.dangerBar, { flexGrow: dangerRatio }]} />
            </View>
              <Slider
                /*
                 * key に初期薬剤IDを指定することで、薬剤が変わった際に
                 * スライダーを再マウントし、初期値を正しく反映させる
                 */
                key={initialDrug}
                minimumValue={0}
                maximumValue={doseMax}
                step={doseSliderStep}
                value={dose}
                onValueChange={updateFromDose}
                minimumTrackTintColor="transparent"
                maximumTrackTintColor="transparent"
                thumbTintColor="black"
                // OS ごとに高さが異なるため固定値で統一
                style={styles.slider}
              />
            <View style={styles.doseScale}>
              <Text>0</Text>
              <Text>
                {doseMax}
                {drug.doseUnit}
              </Text>
            </View>
          </View>
        </Surface>

        {/* ===== DangerDose Card ===== */}
        <Surface elevation={1} style={styles.dangerCard}>
          <Text style={styles.infoText}>閾値 :</Text>

          {/* 閾値が無い薬剤では “—” 表示 */}
          <Text style={[styles.infoText, styles.dangerBox]}>
            {dangerDoseVal !== undefined
              ? `${dangerDoseVal}${drug.doseUnit}`
              : '—'}
          </Text>

          <Text style={styles.infoText}> = </Text>

          <Text style={[styles.infoText, styles.dangerBox]}>
            {dangerFlowMlH !== null ? `${dangerFlowMlH.toFixed(1)} ml/h` : '—'}
          </Text>
        </Surface>

        {/* ===== ④ 添付文書 / 補足説明 ===== */}
        <Surface elevation={1} style={styles.brochure}>
          {/* 設定ファイルから薬剤の説明文を表示 */}
          <Text variant="bodyMedium" style={{ color: "#666" }}>
            {drug.description}
          </Text>
        </Surface>
      </ScrollView>
      <CompositionDialog
        visible={dialogVisible}
        onDismiss={() => setDialogVisible(false)}
        doseMg={doseMg}
        volumeMl={volumeMl}
        weightKg={weightKg}
        onSubmit={handleSubmitValues}
      />
      {/* AsyncStorage エラー通知用 */}
      <DrugConfigSnackbar />
    </SafeAreaView>
  );
}

/* ===== StyleSheet ===== */
const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingVertical: 4,
    position: "relative",
    width: "100%",
  },
  /* 中央ボタン：画面幅の 80 % で固定 */
  centerButton: {
    backgroundColor: "#c8f5f0",
    width: WINDOW_WIDTH * 0.75,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: "center",
    alignItems: "center",
  },
  /* 右上に絶対配置された設定ボタン */
  settingBtn: {
    position: "absolute",
    right: 2,
    top: -2,
    paddingBottom: 8,
    paddingHorizontal: 2,
  },
  infoCard: {
    marginTop: 4,
    padding: 6,
    borderRadius: 10,
    backgroundColor: "#d7d7d7",
    flexDirection: "row",   // 1 行に並べる
    justifyContent: 'center',
    flexWrap: "nowrap",     // ★ 折り返し禁止
    alignItems: "center",
    position: "relative",
  },
  infoText: {
    fontSize: 14,
  },
  /* 3 つの数値用 ―― 背景だけ少し濃く統一 */
  valueBox: {
    backgroundColor: '#c0c0c0',   // #d7d7d7 より一段濃いグレー
    paddingHorizontal: 8,
    borderRadius: 2,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 2,
    fontSize: 16,
  },
  concText: {
    marginHorizontal: 2,   // 文字間の余白
    fontSize: 14,
    color: '#333',
  },
  flowCardBlue: {
    marginHorizontal: 8,
    marginTop: 8,
    /* 矢印を灰色ボックスの上下に“はみ出さず”置くため縦方向の余白を拡張 */
    paddingHorizontal: 8,
    paddingTop: 28, // ▲ の高さぶん余白を確保
    paddingBottom: 28, // ▼ の高さぶん余白を確保
    borderRadius: 10,
    backgroundColor: "#daf7f9",
    alignItems: "center",
  },
  flowCardGreen: {
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 8,
    paddingHorizontal: 8,
    paddingTop: 28,
    paddingBottom: 28,
    borderRadius: 10,
    backgroundColor: "#ddf9e8",
    alignItems: "center",
  },
  /* ★ 高容量時：背景を淡い赤に上書き */
  flowCardDanger: {
    backgroundColor: '#ffecec',    // 好みで #ffefef などに調整
  },
  /* ── ▲▼ を数字の上・下に均等配置 ── */
  /* ▲ を桁の真上に配置（数字列の中央を基準に等間隔） */
  arrowRowTop: {
    position: "absolute",
    top: -8,
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 10,
  },
  /* ▼ を桁の真下に配置 (ml/h 用) */
  arrowRowBottom: {
    position: "absolute",
    bottom: -10,
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 10,
  },

  /* ▲▼ を桁の中央に置くためのラッパー */
  /* 子セル: flex 1 で中央寄せしつつ、左右に桁間の半分ずつ余白 */
  arrowCell: {
    alignItems: "center",
    transform: [{ translateX: DISPLAY_SHIFT }],
    marginHorizontal: DIGIT_SPACING + 1,
  },

  /* ▼ 投与量用：灰色ボックス直下に配置 */
  arrowRowBelow: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    top: 105, // ↕ スライダーの上に来る
    zIndex: 10,
  },
  /* ==== new ==== */
  /* ── 灰色ボックス ── */
  displayBox: {
    width: "90%",
    /* 桁数に合わせて自動サイズ。
       端末幅が広い場合でも “中央から DISPLAY_SHIFT だけ左” へ配置 */
    minWidth: 220, // 必要に応じて調整
    maxWidth: "100%",
    backgroundColor: "#c0c0c0",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // ⬅ 単位ラベルを絶対配置するため
    alignSelf: "center",
  },
  /* 数値のみを左に寄せるラッパー */
  numberWrapper: {
    transform: [{ translateX: DISPLAY_SHIFT }],
  },
  /* ── 単位: 右下に固定 ── */
  unitInside: {
    position: "absolute",
    right: 4,
    bottom: 1,
    fontSize: 20,
    fontWeight: "500",
  },
  /* ---- スライダー：固定位置（marginTop） ---- */
  sliderContainer: {
    width: "100%",
    alignSelf: "center",
    marginTop: 30,
    position: "relative",
    height: 40,
  },
  // スライダー自体の高さを一定に保つ
  slider: {
    height: 40,
  },
  /* 2 色バー全体をスライダー中央に重ねる */
  trackOverlay: {
    position: "absolute",
    left: 10,
    right: 10,
    top: "50%",
    transform: [{ translateY: -2 }], // 4px 高の半分
    height: 4,
    flexDirection: "row",
    borderRadius: 2,
    overflow: "hidden",
  },
  /* 安全域 (左側) */
  safeBar: {
    backgroundColor: "green",
  },
  /* 危険域 (右側) */
  dangerBar: {
    backgroundColor: "red",
  },
  doseScale: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dangerCard: {
    marginHorizontal: 8,
    marginTop: 2,
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#f9e4e4',  // 任意：薄い赤で注意を示す
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerBox: {
    backgroundColor: '#f9e4e4',  // 任意：薄い赤で注意を示す
    paddingHorizontal: 8,
    borderRadius: 2,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 2,
    fontSize: 16,
  },
  brochure: {
    margin: 8,
    borderRadius: 10,
    backgroundColor: "#d7d7d7",
    padding: 12,
  },
});
