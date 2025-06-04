import React, { useState } from 'react';
import {
  StyleSheet,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
// UI 表示には react-native-paper の Text と Surface コンポーネントを使用
import { Surface, Text, TextInput, Snackbar } from 'react-native-paper';
// スライダーコンポーネントを利用する
// スライダーを Paper のテーマに合わせたコンポーネント
import PaperSlider from './PaperSlider';
import {
  convertDoseToRate,
  convertRateToDose,
  DEFAULT_CONCENTRATION,
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
const WEIGHT_MIN = 2;
const WEIGHT_MAX = 200;
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
      showToast("体重は2\u2013200kgの範囲です");
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

  // 濃度入力時の処理。TextInput からは文字列が渡される
  const handleConcentrationChange = (text: string): void => {
    const num = Number(text);
    if (Number.isNaN(num)) {
      setSnackbar('濃度は数値で入力してください');
      return;
    }
    if (num <= 0 || num > 1000) {
      setSnackbar('濃度は1\u20131000µg/mlの範囲です');
      return;
    }
    setConcentration(num);
    // 濃度変更に伴い流量・投与量を再計算する
    const r = roundStep(convertDoseToRate(dose, weight, num), 0.1);
    setRate(Math.max(RATE_MIN, Math.min(RATE_MAX, r)));
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
      {/* 濃度入力欄 */}
      <Text style={styles.label}>濃度: {concentration.toFixed(0)} µg/ml</Text>
      <TextInput
        mode="outlined"
        style={styles.input}
        value={String(concentration)}
        keyboardType="numeric"
        onChangeText={handleConcentrationChange}
      />
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
  label: {
    fontSize: 14,
    marginTop: 12,
  },
});
