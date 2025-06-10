import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Surface, Text, Divider, Menu } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import DigitalNumber from '@/components/DigitalNumber';
import { IconButton } from 'react-native-paper';
import CompositionDialog from '@/components/CompositionDialog';

import { DIGIT_SPACING } from '@/components/DigitalNumber';   // ← 追加
import {
  convertDoseToRate,
  convertRateToDose,
  computeConcentration,
} from '@/utils/flowConversion';
import { useDrugConfigs } from '../contexts/DrugConfigContext';

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
    convertDoseToRate(drug.initialDose, weightKg, initialConc),
  );
  const [gamma, setGamma] = useState(drug.initialDose);
  // スライダーの上限
  const gammaMax = drug.doseMax;

  /* === 各桁ごとのインクリメント / デクリメント === */
  // ml/h : 3 桁（10, 1, 0.1）
  const flowSteps  = [10, 1, 0.1];
  // γ    : 4 桁（10, 1, 0.1, 0.01）
  const gammaSteps = [10, 1, 0.1, 0.01];

  // 濃度(µg/ml)を都度計算する。useMemo で不要な再計算を避ける
  const concentration = useMemo(
    () => computeConcentration(doseMg, drug.soluteUnit, volumeMl),
    [doseMg, volumeMl, drug.soluteUnit],
  );

  /** ml/h 変更時に γ を自動更新する */
  const updateFromFlow = (value: number): void => {
    const flow = Math.max(0, +value.toFixed(1));
    setFlowMlH(flow);
    const g = convertRateToDose(flow, weightKg, concentration);
    setGamma(+g.toFixed(2));
  };

  /** γ 変更時に ml/h を自動更新する */
  const updateFromGamma = (value: number): void => {
    const g = Math.max(0, +value.toFixed(2));
    setGamma(g);
    const flow = convertDoseToRate(g, weightKg, concentration);
    setFlowMlH(+flow.toFixed(1));
  };

  const incFlow = (idx: number) => updateFromFlow(flowMlH + flowSteps[idx]);
  const decFlow = (idx: number) => updateFromFlow(flowMlH - flowSteps[idx]);
  const incGamma = (idx: number) => updateFromGamma(gamma + gammaSteps[idx]);
  const decGamma = (idx: number) => updateFromGamma(gamma - gammaSteps[idx]);

  // メニューから薬剤を選択したときの処理
  const handleSelectDrug = async (drugId: keyof typeof configs) => {
    await setInitialDrug(drugId);
    setDrugMenuVisible(false);
  };

  // ダイアログで保存された値を反映
  const handleSubmitValues = useCallback(
    (dose: number, volume: number, weight: number) => {
      setDoseMg(dose);
      setVolumeMl(volume);
      setWeightKg(weight);
      // 組成や体重が変わったら流量を基準に γ を計算し直す
      const conc = computeConcentration(dose, drug.soluteUnit, volume);
      const g = convertRateToDose(flowMlH, weight, conc);
      setGamma(+g.toFixed(2));
    },
    [flowMlH],
  );

  // 選択薬剤が変わったら各値を初期設定に更新
  useEffect(() => {
    const next = configs[initialDrug];
    setDoseMg(next.soluteAmount);
    setVolumeMl(next.solutionVolume);
    setGamma(next.initialDose);
    const conc = computeConcentration(
      next.soluteAmount,
      next.soluteUnit,
      next.solutionVolume,
    );
    const flow = convertDoseToRate(next.initialDose, weightKg, conc);
    setFlowMlH(+flow.toFixed(1));
  }, [initialDrug, configs, weightKg]);

  // 組成や体重が変化したときは現在の流量からγを再計算する
  useEffect(() => {
    const g = convertRateToDose(flowMlH, weightKg, concentration);
    setGamma(+g.toFixed(2));
  }, [concentration, weightKg]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        style={{ flex: 1 }}
      >
      {/* ===== Header ===== */}
      <View style={styles.header}>
        <Menu
          visible={drugMenuVisible}
          onDismiss={() => setDrugMenuVisible(false)}
          anchor=
            {(
              <Pressable
                style={styles.centerButton}
                onPress={() => setDrugMenuVisible(true)}
              >
                {/* 薬剤名を設定ファイルから表示 */}
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                  {drug.label}
                </Text>
              </Pressable>
            )}
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
        <Pressable
          style={styles.settingBtn}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text variant="titleLarge">⚙️</Text>
        </Pressable>
      </View>
      <Divider bold style={{ height: 1 }} />

      {/* ===== ① 組成 / 体重 ===== */}
      <Surface elevation={1} style={styles.infoCard}>
        <Text>組成：</Text>
        <EditableBox value={doseMg} onPress={() => setDialogVisible(true)} />
        <Text> {drug.soluteUnit} / </Text>
        <EditableBox value={volumeMl} onPress={() => setDialogVisible(true)} />
        <Text> ml　体重 </Text>
        <EditableBox value={weightKg} onPress={() => setDialogVisible(true)} />
        <Text> kg</Text>

        <Text style={{ width: '100%', marginTop: 4 }}>
          濃度：{concentration.toFixed(0)} µg/ml
        </Text>
      </Surface>

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
          {/* ml/h は「2 整数桁 + 1 小数桁」= 3 桁固定 */}
          <DigitalNumber value={flowMlH} intDigits={2} fracDigits={1} />
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

      {/* ===== ③ γ ===== */}
      <Surface elevation={2} style={styles.flowCardGreen}>
        {/* ▲ 上段：3 桁ぶん */}
        <View style={styles.arrowRowTop}>
          {gammaSteps.map((_, i) => (
            <View key={i} style={styles.arrowCell}>
              <IconButton
                icon="chevron-up"
                size={22}
                onPress={() => incGamma(i)}
              />
            </View>
          ))}
        </View>

        {/* デジタル数字＋単位を灰色ボックス内に表示 */}
        <View style={styles.displayBox}>
          {/* γ は「2 整数桁 + 2 小数桁」= 4 桁固定 */}
          <DigitalNumber value={gamma} intDigits={2} fracDigits={2} />
          <Text style={styles.unitInside}>γ</Text>
        </View>
        {/* ▼ 下段：3 桁ぶん */}
        <View style={styles.arrowRowBelow}>
          {gammaSteps.map((_, i) => (
            <View key={i} style={styles.arrowCell}>
              <IconButton
                icon="chevron-down"
                size={22}
                onPress={() => decGamma(i)}
              />
            </View>
          ))}
        </View>

        {/* スライダー */}
        <View style={{ width: '100%', paddingHorizontal: 8, marginTop: 4 }}>
          {/* 危険域を示す赤いバーをスライダーの下に重ねる */}
          {drug.dangerDose !== undefined && (
            <View
              pointerEvents="none"
              style={[
                styles.dangerTrack,
                {
                  left: `${(drug.dangerDose / gammaMax) * 100}%`,
                  width: `${((gammaMax - drug.dangerDose) / gammaMax) * 100}%`,
                },
              ]}
            />
          )}
          <Slider
            /*
             * key に初期薬剤IDを指定することで、薬剤が変わった際に
             * スライダーを再マウントし、初期値を正しく反映させる
             */
            key={initialDrug}
            minimumValue={0}
            maximumValue={gammaMax}
            step={drug.doseStep}
            value={gamma}
            onValueChange={updateFromGamma}
            minimumTrackTintColor="green"
            thumbTintColor="black"
          />
          <View style={styles.gammaScale}>
            <Text>0</Text>
            <Text>{gammaMax}γ</Text>
          </View>
        </View>
        {/* 危険域に入ったら警告メッセージを表示 */}
        {drug.dangerDose !== undefined && gamma >= drug.dangerDose && (
          <Text style={styles.dangerMessage}>
            高用量です。注意して投与して下さい。
          </Text>
        )}
      </Surface>

      {/* ===== ④ 添付文書 / 補足説明 ===== */}
      <Surface elevation={1} style={styles.brochure}>
        {/* 設定ファイルから薬剤の説明文を表示 */}
        <Text variant="bodyMedium" style={{ color: '#666' }}>
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
    </SafeAreaView>
  );
}

/* ===== 数値入力可能なラベル ===== */
function EditableBox(props: { value: number; onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress}>
      <Text style={styles.editableBox}>{props.value}</Text>
    </Pressable>
  );
}

/* ===== StyleSheet ===== */
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  centerButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#c8f5f0',
    marginLeft: 50,
    marginRight: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  settingBtn: { paddingHorizontal: 8 },
  infoCard: {
    margin: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#d7d7d7',
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
  },
  editableBox: {
    backgroundColor: '#9ea29e',
    paddingHorizontal: 10,
    borderRadius: 4,
    fontWeight: 'bold',
  },
  flowCardBlue: {
    marginHorizontal: 8,
    marginTop: 8,
    /* 矢印を灰色ボックスの上下に“はみ出さず”置くため縦方向の余白を拡張 */
    paddingHorizontal: 12,
    paddingTop: 48,    // ▲ の高さぶん余白を確保
    paddingBottom: 48, // ▼ の高さぶん余白を確保
    borderRadius: 12,
    backgroundColor: '#daf7f9',
    alignItems: 'center',
  },
  flowCardGreen: {
    margin: 8,
    paddingHorizontal: 12,
    paddingTop: 48,
    paddingBottom: 48,
    borderRadius: 12,
    backgroundColor: '#ddf9e8',
    alignItems: 'center',
    position: 'relative',
  },
    /* ── ▲▼ を数字の上・下に均等配置 ── */
  /* ▲ を桁の真上に配置（数字列の中央を基準に等間隔） */
  arrowRowTop: {
    position: 'absolute',
    top: 10,
    width: '95%',          // 灰色ボックスと同じ幅
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 10,
  },
  /* ▼ を桁の真下に配置 (ml/h 用) */
  arrowRowBottom: {
    position: 'absolute',
    bottom: 12,
    width: '95%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 10,
  },

  /* ▲▼ を桁の中央に置くためのラッパー */


  /* 子セル: flex 1 で中央寄せしつつ、左右に桁間の半分ずつ余白 */
  arrowCell: {
    alignItems: 'center',
    marginHorizontal: DIGIT_SPACING + 1,
  },

  /* ▼ γ 用：灰色ボックス直下に配置 */
  arrowRowBelow: {
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  /* ==== new ==== */
  /* ── 灰色ボックス ── */
  displayBox: {
    width: '95%',
    backgroundColor: '#c0c0c0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',   // ⬅ 数字を中央に
    justifyContent: 'center',
    position: 'relative',   // ⬅ 単位ラベルを絶対配置するため
    alignSelf: 'center',
  },
  /* ── 単位: 右下に固定 ── */
  unitInside: {
    position: 'absolute',
    right: 12,
    bottom: 6,
    fontSize: 26,
    fontWeight: '500',
  },
  // 危険域バーのスタイル
  dangerTrack: {
    position: 'absolute',
    height: 4,
    backgroundColor: 'red',
    top: 20, // スライダーのトラック位置に合わせて調整
    borderRadius: 2,
  },
  // 危険域メッセージのスタイル
  dangerMessage: {
    color: 'red',
    marginTop: 4,
    alignSelf: 'center',
  },
  gammaScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brochure: {
    margin: 8,
    borderRadius: 12,
    backgroundColor: '#d7d7d7',
    padding: 12,
  },
});
