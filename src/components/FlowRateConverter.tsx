import React, { useState } from 'react';
import {
  StyleSheet,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
// UI 表示には react-native-paper の Text と Surface コンポーネントを使用
import {
  Surface,
  Text,
  TextInput,
  Snackbar,
  RadioButton,
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
  computeConcentration,
  SoluteUnit,
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
const DOSE_MIN = 0;
const DOSE_MAX = 5;
const RATE_MIN = 0;
const RATE_MAX = 100;

export type FlowRateConverterProps = {};

// メインコンポーネント
export default function FlowRateConverter(_: FlowRateConverterProps) {
  // 初期値: 体重50kg、投与量0.03µg/kg/min
  const [weight, setWeight] = useState(50);
  const [dose, setDose] = useState(0.03);
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

  // 体重変更時の処理
  const handleWeightChange = (w: number): void => {
    let value = roundStep(w, 1);
    if (value < WEIGHT_MIN || value > WEIGHT_MAX) {
      showToast("体重は20\u2013120kgの範囲です");
      value = Math.max(WEIGHT_MIN, Math.min(WEIGHT_MAX, value));
    }
    setWeight(value);
    const r = roundStep(convertDoseToRate(dose, value, concentration), 0.1);
    if (r < RATE_MIN || r > RATE_MAX) {
      showToast("流量は0\u2013100ml/hrの範囲です");
    }
    setRate(Math.max(RATE_MIN, Math.min(RATE_MAX, r)));
  };

  // 投与量変更時の処理
  const handleDoseChange = (d: number): void => {
    let value = roundStep(d, 0.01);
    if (value < DOSE_MIN || value > DOSE_MAX) {
      showToast("投与量は0\u20135\u00b5g/kg/minの範囲です");
      value = Math.max(DOSE_MIN, Math.min(DOSE_MAX, value));
    }
    setDose(value);
    const r = roundStep(convertDoseToRate(value, weight, concentration), 0.1);
    if (r < RATE_MIN || r > RATE_MAX) {
      showToast("流量は0\u2013100ml/hrの範囲です");
    }
    setRate(Math.max(RATE_MIN, Math.min(RATE_MAX, r)));
  };

  // 流量変更時の処理
  const handleRateChange = (r: number): void => {
    let value = roundStep(r, 0.1);
    if (value < RATE_MIN || value > RATE_MAX) {
      showToast("流量は0\u2013100ml/hrの範囲です");
      value = Math.max(RATE_MIN, Math.min(RATE_MAX, value));
    }
    setRate(value);
    const d = roundStep(convertRateToDose(value, weight, concentration), 0.01);
    if (d < DOSE_MIN || d > DOSE_MAX) {
      showToast("投与量は0\u20135\u00b5g/kg/minの範囲です");
    }
    setDose(Math.max(DOSE_MIN, Math.min(DOSE_MAX, d)));
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
    setRate(Math.max(RATE_MIN, Math.min(RATE_MAX, r)));
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
    updateConcentration(soluteAmount, unit, solutionVolume);
  };

  return (
    // Surface は Paper の View 相当コンポーネント
    <Surface style={styles.container}>
      <Text style={styles.title}>ノルアドレナリン換算ツール</Text>
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
        minimumValue={DOSE_MIN}
        maximumValue={DOSE_MAX}
        step={0.01}
      />
      {/* 溶質量入力欄 */}
      <Text style={styles.label}>溶質量: {soluteAmount} {soluteUnit}</Text>
      <TextInput
        mode="outlined"
        style={styles.input}
        value={String(soluteAmount)}
        keyboardType="numeric"
        onChangeText={handleAmountChange}
      />
      {/* mg/µg 選択用ラジオボタン */}
      <RadioButton.Group
        onValueChange={handleUnitChange}
        value={soluteUnit}
        style={styles.radioGroup}
      >
        <RadioButton.Item label="mg" value="mg" />
        <RadioButton.Item label="µg" value="µg" />
      </RadioButton.Group>
      {/* 溶液量入力欄 */}
      <Text style={styles.label}>溶液量: {solutionVolume} ml</Text>
      <TextInput
        mode="outlined"
        style={styles.input}
        value={String(solutionVolume)}
        keyboardType="numeric"
        onChangeText={handleVolumeChange}
      />
      {/* 濃度表示 */}
      <Text style={styles.label}>濃度: {concentration.toFixed(0)} µg/ml</Text>
      {/* 流量調整用スライダー */}
      <Text style={styles.label}>流量: {rate.toFixed(1)} ml/hr</Text>
      <PaperSlider
        style={styles.slider}
        value={rate}
        onValueChange={handleRateChange}
        minimumValue={RATE_MIN}
        maximumValue={RATE_MAX}
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
  radioGroup: {
    flexDirection: "row",
  },
  label: {
    fontSize: 14,
    marginTop: 12,
  },
});
