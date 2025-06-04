import React, { useState } from 'react';
import {
  StyleSheet,
  Platform,
  ToastAndroid,
  Alert,
  View,
} from 'react-native';
// UI 表示には react-native-paper の Text と Surface コンポーネントを使用
import {
  Surface,
  Text,
  TextInput,
  Snackbar,
  Menu,
  Button,
} from 'react-native-paper';
// スライダーコンポーネントを利用する
// スライダーを Paper のテーマに合わせたコンポーネント
import PaperSlider from './PaperSlider';
import {
  convertDoseToRate,
  convertRateToDose,
  DEFAULT_CONCENTRATION,
  DEFAULT_SOLUTE_AMOUNT,
  DEFAULT_SOLUTE_UNIT,
  DEFAULT_SOLUTION_VOLUME,
  formatComposition,
  computeConcentration,
  SoluteUnit,
  DRUGS,
  DrugType,
} from '../utils/flowConversion';

// Toast 表示をプラットフォーム別に行う簡易関数
// 簡易的なメッセージ表示
function showToast(message: string): void {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(message);
  }
}

// 刻み幅で四捨五入するユーティリティ
// 任意の刻み幅で四捨五入する
function roundStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

// 各ダイアルの設定値
const WEIGHT_MIN = 20;
const WEIGHT_MAX = 120;
export type Range = {
  min: number;
  max: number;
};

export type FlowRateConverterProps = {};

// メインコンポーネント
export default function FlowRateConverter(_: FlowRateConverterProps) {
  // 初期値: 体重50kg、投与量0.03µg/kg/min
  const [drug, setDrug] = useState<DrugType>('norepinephrine');
  const [weight, setWeight] = useState(50);
  const [dose, setDose] = useState(0.03);
  // 投与量・流量の範囲を薬剤ごとに保持
  const [doseRange, setDoseRange] = useState<Range>({
    min: DRUGS.norepinephrine.doseMin,
    max: DRUGS.norepinephrine.doseMax,
  });
  const [rateRange, setRateRange] = useState<Range>({
    min: convertDoseToRate(DRUGS.norepinephrine.doseMin, 50, DEFAULT_CONCENTRATION),
    max: convertDoseToRate(DRUGS.norepinephrine.doseMax, 50, DEFAULT_CONCENTRATION),
  });
  // 濃度計算用のパラメータ
  const [soluteAmount, setSoluteAmount] = useState(DEFAULT_SOLUTE_AMOUNT);
  const [soluteUnit, setSoluteUnit] = useState<SoluteUnit>(DEFAULT_SOLUTE_UNIT);
  const [solutionVolume, setSolutionVolume] = useState(
    DEFAULT_SOLUTION_VOLUME,
  );
  const [concentration, setConcentration] = useState(DEFAULT_CONCENTRATION);
  const [rate, setRate] = useState(
    roundStep(convertDoseToRate(0.03, 50, DEFAULT_CONCENTRATION), 0.1),
  );
  // Snackbar 用の状態管理
  const [snackbar, setSnackbar] = useState('');
  // 薬剤選択メニューの表示状態
  const [menuVisible, setMenuVisible] = useState(false);
  // 単位選択メニューの表示状態
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);

  // 投与量範囲から流量範囲を計算する共通処理
  const updateRateRange = (w: number, conc: number, range: Range): void => {
    setRateRange({
      min: roundStep(convertDoseToRate(range.min, w, conc), 0.1),
      max: roundStep(convertDoseToRate(range.max, w, conc), 0.1),
    });
  };

  // 体重変更時の処理
  const handleWeightChange = (w: number): void => {
    let value = roundStep(w, 1);
    if (value < WEIGHT_MIN || value > WEIGHT_MAX) {
      showToast("体重は20\u2013120kgの範囲です");
      value = Math.max(WEIGHT_MIN, Math.min(WEIGHT_MAX, value));
    }
    setWeight(value);
    const r = roundStep(convertDoseToRate(dose, value, concentration), 0.1);
    const min = rateRange.min;
    const max = rateRange.max;
    if (r < min || r > max) {
      showToast(`流量は${min}\u2013${max}ml/hrの範囲です`);
    }
    setRate(Math.max(min, Math.min(max, r)));
    updateRateRange(value, concentration, doseRange);
  };

  // 投与量変更時の処理
  const handleDoseChange = (d: number): void => {
    let value = roundStep(d, 0.01);
    if (value < doseRange.min || value > doseRange.max) {
      showToast(
        `投与量は${doseRange.min}\u2013${doseRange.max}\u00b5g/kg/minの範囲です`,
      );
      value = Math.max(doseRange.min, Math.min(doseRange.max, value));
    }
    setDose(value);
    const r = roundStep(convertDoseToRate(value, weight, concentration), 0.1);
    if (r < rateRange.min || r > rateRange.max) {
      showToast(`流量は${rateRange.min}\u2013${rateRange.max}ml/hrの範囲です`);
    }
    setRate(Math.max(rateRange.min, Math.min(rateRange.max, r)));
  };

  // 流量変更時の処理
  const handleRateChange = (r: number): void => {
    let value = roundStep(r, 0.1);
    if (value < rateRange.min || value > rateRange.max) {
      showToast(`流量は${rateRange.min}\u2013${rateRange.max}ml/hrの範囲です`);
      value = Math.max(rateRange.min, Math.min(rateRange.max, value));
    }
    setRate(value);
    const d = roundStep(convertRateToDose(value, weight, concentration), 0.01);
    if (d < doseRange.min || d > doseRange.max) {
      showToast(
        `投与量は${doseRange.min}\u2013${doseRange.max}\u00b5g/kg/minの範囲です`,
      );
    }
    setDose(Math.max(doseRange.min, Math.min(doseRange.max, d)));
  };

  // 入力値から濃度を計算して更新する共通処理
  const updateConcentration = (
    amount: number,
    unit: SoluteUnit,
    volume: number,
  ): void => {
    const c = computeConcentration(amount, unit, volume);
    if (Number.isNaN(c) || c <= 0 || c > 1000) {
      setSnackbar('濃度は1\u20131000µg/mlの範囲です');
      return;
    }
    setConcentration(c);
    // 濃度変更時は流量も再計算する
    const r = roundStep(convertDoseToRate(dose, weight, c), 0.1);
    updateRateRange(weight, c, doseRange);
    setRate(Math.max(rateRange.min, Math.min(rateRange.max, r)));
  };

  // 溶質量変更時の処理
  const handleAmountChange = (text: string): void => {
    const num = Number(text);
    if (Number.isNaN(num)) {
      setSnackbar('溶質量は数値で入力してください');
      return;
    }
    setSoluteAmount(num);
    updateConcentration(num, soluteUnit, solutionVolume);
  };

  // 溶液量変更時の処理
  const handleVolumeChange = (text: string): void => {
    const num = Number(text);
    if (Number.isNaN(num)) {
      setSnackbar('溶液量は数値で入力してください');
      return;
    }
    setSolutionVolume(num);
    updateConcentration(soluteAmount, soluteUnit, num);
  };

  // 単位(mg/µg)変更時の処理
  const handleUnitChange = (value: string): void => {
    const unit = value as SoluteUnit;
    setSoluteUnit(unit);
    setUnitMenuVisible(false);
    updateConcentration(soluteAmount, unit, solutionVolume);
  };

  // 薬剤変更時の処理
  const handleDrugChange = (value: string): void => {
    const info = DRUGS[value as DrugType];
    setDrug(value as DrugType);
    setSoluteAmount(info.soluteAmount);
    setSoluteUnit(info.soluteUnit);
    setSolutionVolume(info.solutionVolume);
    setDoseRange({ min: info.doseMin, max: info.doseMax });
    const conc = computeConcentration(
      info.soluteAmount,
      info.soluteUnit,
      info.solutionVolume,
    );
    setConcentration(conc);
    const newRange = {
      min: info.doseMin,
      max: info.doseMax,
    };
    setDoseRange(newRange);
    updateRateRange(weight, conc, newRange);
    // 初期投与量と流量を範囲内に調整
    const d = Math.max(newRange.min, Math.min(newRange.max, dose));
    setDose(d);
    const r = roundStep(convertDoseToRate(d, weight, conc), 0.1);
    const minRate = convertDoseToRate(newRange.min, weight, conc);
    const maxRate = convertDoseToRate(newRange.max, weight, conc);
    setRate(Math.max(minRate, Math.min(maxRate, r)));
  };

  // メニューから薬剤を選択したときの処理
  const handleDrugSelect = (value: DrugType): void => {
    handleDrugChange(value);
    setMenuVisible(false);
  };

  return (
    // Surface は Paper の View 相当コンポーネント
    <Surface style={styles.container}>
      {/* 画面上部のタイトルを固定の文言に変更 */}
      <Text style={styles.title}>投与量・流量換算ツール</Text>
      {/* 薬剤選択 */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={<Button mode="outlined" onPress={() => setMenuVisible(true)}>{DRUGS[drug].label}</Button>}
      >
        <Menu.Item
          onPress={() => handleDrugSelect('norepinephrine')}
          title="ノルアドレナリン"
        />
        <Menu.Item
          onPress={() => handleDrugSelect('dopamine')}
          title="ドパミン"
        />
      </Menu>
      {/* 体重調整用スライダー */}
      <Text style={styles.label}>体重: {weight.toFixed(0)} kg</Text>
      <PaperSlider
        style={styles.slider}
        value={weight}
        onValueChange={handleWeightChange}
        minimumValue={WEIGHT_MIN}
        maximumValue={WEIGHT_MAX}
        step={1}
      />
      {/* 投与量調整用スライダー */}
      <Text style={styles.label}>投与量: {dose.toFixed(2)} µg/kg/min</Text>
      <PaperSlider
        style={styles.slider}
        value={dose}
        onValueChange={handleDoseChange}
        minimumValue={doseRange.min}
        maximumValue={doseRange.max}
        dangerThreshold={DRUGS[drug].dangerDose}
        step={0.01}
      />
      {/* 溶質量・単位・溶液量を横並びで入力する */}
      <Text style={styles.label}>
        組成: {formatComposition(soluteAmount, soluteUnit, solutionVolume)}
      </Text>
      <View style={styles.compositionRow}>
        <TextInput
          mode="outlined"
          style={styles.compInput}
          value={String(soluteAmount)}
          keyboardType="numeric"
          onChangeText={handleAmountChange}
        />
        <Menu
          visible={unitMenuVisible}
          onDismiss={() => setUnitMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setUnitMenuVisible(true)}
              style={styles.compInput}
            >
              {soluteUnit}
            </Button>
          }
        >
          <Menu.Item onPress={() => handleUnitChange('mg')} title="mg" />
          <Menu.Item onPress={() => handleUnitChange('µg')} title="µg" />
        </Menu>
        <Text style={styles.inlineText}>/</Text>
        <TextInput
          mode="outlined"
          style={styles.compInput}
          value={String(solutionVolume)}
          keyboardType="numeric"
          onChangeText={handleVolumeChange}
        />
        <Text style={styles.inlineText}>ml</Text>
      </View>
      {/* 濃度表示 */}
      <Text style={styles.label}>濃度: {concentration.toFixed(0)} µg/ml</Text>
      {/* 流量調整用スライダー */}
      <Text style={styles.label}>流量: {rate.toFixed(1)} ml/hr</Text>
      <PaperSlider
        style={styles.slider}
        value={rate}
        onValueChange={handleRateChange}
        minimumValue={rateRange.min}
        maximumValue={rateRange.max}
        step={0.1}
      />
      {/* Snackbar でバリデーションメッセージを表示 */}
      <Snackbar
        visible={snackbar.length > 0}
        onDismiss={() => setSnackbar('')}
        duration={2000}
      >
        {snackbar}
      </Snackbar>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    marginBottom: 8,
  },
  // スライダー用の共通スタイル
  slider: {
    width: "80%",
    marginVertical: 8,
  },
  input: {
    width: "80%",
    marginVertical: 8,
  },
  // 溶質量・単位・溶液量の入力行
  compositionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  // 組成入力用の小さなテキスト入力
  compInput: {
    width: 70,
    marginHorizontal: 4,
  },
  // 行内表示用のテキスト
  inlineText: {
    fontSize: 14,
    marginHorizontal: 4,
  },
  label: {
    fontSize: 14,
    marginTop: 12,
  },
});
