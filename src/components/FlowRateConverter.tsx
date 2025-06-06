import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Platform,
  ToastAndroid,
  Alert,
  View,
  ScrollView,
} from 'react-native';
// UI 表示には react-native-paper の Text と Surface コンポーネントを使用
import {
  Surface,
  Text,
  TextInput,
  Snackbar,
  Menu,
  Button,
  IconButton,
} from 'react-native-paper';
// 端末にデータを保存するため AsyncStorage を利用
import AsyncStorage from '@react-native-async-storage/async-storage';
// スライダーコンポーネントを利用する
// スライダーを Paper のテーマに合わせたコンポーネント
import PaperSlider from './PaperSlider';
import {
  convertDoseToRate,
  convertRateToDose,
  computeConcentration,
} from '../utils/flowConversion';
import { SoluteUnit } from '../types';
import { DrugType } from '../config/drugs';
import { useDrugConfigs } from '../contexts/DrugConfigContext';

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
// 体重を保存する際のキー名
const STORAGE_KEY_WEIGHT = 'weight';
export type Range = {
  min: number;
  max: number;
};

export type FlowRateConverterProps = {};

// メインコンポーネント
export default function FlowRateConverter(_: FlowRateConverterProps) {
  // 初期値: 体重50kg、薬剤ごとの設定に基づく投与量
  const { configs, initialDrug, setInitialDrug } = useDrugConfigs();
  const [drug, setDrug] = useState<DrugType>(initialDrug);

  // 設定から初期薬剤が変化した場合に state を同期する
  useEffect(() => {
    setDrug(initialDrug);
  }, [initialDrug]);
  const [weight, setWeight] = useState(50);
  // Snackbar 用の状態管理は最初に宣言
  const [snackbar, setSnackbar] = useState('');
  // 初回読み込み時に保存済み体重を取得
  useEffect(() => {
    const loadWeight = async (): Promise<void> => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEY_WEIGHT);
        if (value !== null) {
          const num = Number(value);
          if (!Number.isNaN(num)) {
            setWeight(num);
          }
        }
      } catch {
        setSnackbar('体重の読み込みに失敗しました');
      }
    };
    loadWeight();
  }, []);
  // 体重変更時に保存
  useEffect(() => {
    const saveWeight = async (): Promise<void> => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_WEIGHT, String(weight));
      } catch {
        setSnackbar('体重の保存に失敗しました');
      }
    };
    saveWeight();
  }, [weight]);
  const defaultCfg = configs[initialDrug];
  const [dose, setDose] = useState(defaultCfg.initialDose);
  // 投与量・流量の範囲を薬剤ごとに保持
  const [doseRange, setDoseRange] = useState<Range>({
    min: defaultCfg.doseMin,
    max: defaultCfg.doseMax,
  });
  const [rateRange, setRateRange] = useState<Range>({
    min: convertDoseToRate(
      defaultCfg.doseMin,
      50,
      computeConcentration(defaultCfg.soluteAmount, defaultCfg.soluteUnit, defaultCfg.solutionVolume),
    ),
    max: convertDoseToRate(
      defaultCfg.doseMax,
      50,
      computeConcentration(defaultCfg.soluteAmount, defaultCfg.soluteUnit, defaultCfg.solutionVolume),
    ),
  });
  // 濃度計算用のパラメータ
  const [soluteAmount, setSoluteAmount] = useState(defaultCfg.soluteAmount);
  const [soluteUnit, setSoluteUnit] = useState<SoluteUnit>(defaultCfg.soluteUnit);
  const [solutionVolume, setSolutionVolume] = useState(
    defaultCfg.solutionVolume,
  );
  const [concentration, setConcentration] = useState(
    computeConcentration(defaultCfg.soluteAmount, defaultCfg.soluteUnit, defaultCfg.solutionVolume),
  );
  const [rate, setRate] = useState(
    roundStep(
      convertDoseToRate(
        defaultCfg.initialDose,
        50,
        computeConcentration(defaultCfg.soluteAmount, defaultCfg.soluteUnit, defaultCfg.solutionVolume),
      ),
      defaultCfg.rateStep,
    ),
  );
  // 薬剤選択メニューの表示状態
  const [menuVisible, setMenuVisible] = useState(false);
  // 単位選択メニューの表示状態
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);

  // 表示対象の薬剤一覧
  const enabledDrugs = (Object.keys(configs) as DrugType[]).filter(
    (k) => configs[k].enabled,
  );

  // 選択中の薬剤が非表示になった場合は先頭の薬剤を選ぶ
  useEffect(() => {
    if (!configs[drug]?.enabled && enabledDrugs.length > 0) {
      setDrug(enabledDrugs[0]);
    }
  }, [configs, drug, enabledDrugs]);

  // 設定値または薬剤選択が変わった際に状態を同期する
  useEffect(() => {
    const info = configs[drug];
    setSoluteAmount(info.soluteAmount);
    setSoluteUnit(info.soluteUnit);
    setSolutionVolume(info.solutionVolume);
    const conc = computeConcentration(info.soluteAmount, info.soluteUnit, info.solutionVolume);
    setConcentration(conc);
    setDoseRange({ min: info.doseMin, max: info.doseMax });
    updateRateRange(weight, conc, { min: info.doseMin, max: info.doseMax }, info.rateStep);
    const d = Math.max(info.doseMin, Math.min(info.doseMax, info.initialDose));
    setDose(d);
    const r = roundStep(
      convertDoseToRate(d, weight, conc),
      info.rateStep,
    );
    const minRate = convertDoseToRate(info.doseMin, weight, conc);
    const maxRate = convertDoseToRate(info.doseMax, weight, conc);
    setRate(Math.max(minRate, Math.min(maxRate, r)));
  }, [configs, drug, weight]);

  // 投与量範囲から流量範囲を計算する共通処理
  const updateRateRange = (
    w: number,
    conc: number,
    range: Range,
    step: number = configs[drug].rateStep,
  ): void => {
    setRateRange({
      min: roundStep(convertDoseToRate(range.min, w, conc), step),
      max: roundStep(convertDoseToRate(range.max, w, conc), step),
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
    const r = roundStep(
      convertDoseToRate(dose, value, concentration),
      configs[drug].rateStep,
    );
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
    let value = roundStep(d, configs[drug].doseStep);
    if (value < doseRange.min || value > doseRange.max) {
      showToast(
        `投与量は${doseRange.min}\u2013${doseRange.max}\u00b5g/kg/minの範囲です`,
      );
      value = Math.max(doseRange.min, Math.min(doseRange.max, value));
    }
    setDose(value);
    const r = roundStep(
      convertDoseToRate(value, weight, concentration),
      configs[drug].rateStep,
    );
    if (r < rateRange.min || r > rateRange.max) {
      showToast(`流量は${rateRange.min}\u2013${rateRange.max}ml/hrの範囲です`);
    }
    setRate(Math.max(rateRange.min, Math.min(rateRange.max, r)));
  };

  // 流量変更時の処理
  const handleRateChange = (r: number): void => {
    let value = roundStep(r, configs[drug].rateStep);
    if (value < rateRange.min || value > rateRange.max) {
      showToast(`流量は${rateRange.min}\u2013${rateRange.max}ml/hrの範囲です`);
      value = Math.max(rateRange.min, Math.min(rateRange.max, value));
    }
    setRate(value);
    const d = roundStep(
      convertRateToDose(value, weight, concentration),
      configs[drug].doseStep,
    );
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
    const r = roundStep(
      convertDoseToRate(dose, weight, c),
      configs[drug].rateStep,
    );
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
    setDrug(value as DrugType);
  };

  // メニューから薬剤を選択したときの処理
  const handleDrugSelect = (value: DrugType): void => {
    handleDrugChange(value);
    setMenuVisible(false);
  };

  return (
    // ScrollView で画面からはみ出した場合に縦スクロールできるようにする
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Surface は Paper の View 相当コンポーネント */}
      <Surface style={styles.container}>
      {/* 薬剤選択 */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button mode="outlined" onPress={() => setMenuVisible(true)}>
            {configs[drug].label}
          </Button>
        }
      >
        {enabledDrugs.map((d) => (
          <Menu.Item
            key={d}
            onPress={() => handleDrugSelect(d)}
            title={configs[d].label}
          />
        ))}
      </Menu>
      {/* 体重入力エリア */}
      <View style={styles.inputRow}>
        <Text style={styles.label}>体重:</Text>
        <View style={styles.numberInputContainer}>
          {/* 増量ボタンを横並びで表示 */}
          <View style={styles.buttonRow}>
            {/* 10kg 増加ボタン */}
          <IconButton
            icon={({ color }) => (
              <Text style={[styles.doubleIcon, { color }]}>++</Text>
            )}
            size={20}
            onPress={() => handleWeightChange(weight + 10)}
          />
          <IconButton
            icon="plus"
            size={20}
            onPress={() => handleWeightChange(weight + 1)}
          />
        </View>
        <TextInput
          mode="outlined"
          style={styles.numberInput}
          keyboardType="numeric"
          value={String(weight)}
          onChangeText={(v) => {
            const n = Number(v);
            if (!Number.isNaN(n)) {
              handleWeightChange(n);
            }
          }}
        />
        {/* 減量ボタンを横並びで表示 */}
        <View style={styles.buttonRow}>
          {/* 10kg 減少ボタンを左に配置 */}
          <IconButton
            icon={({ color }) => (
              <Text style={[styles.doubleIcon, { color }]}>--</Text>
            )}
            size={20}
            onPress={() => handleWeightChange(weight - 10)}
          />
          <IconButton
            icon="minus"
            size={20}
            onPress={() => handleWeightChange(weight - 1)}
          />
        </View>
        </View>
        <Text style={styles.inlineText}>kg</Text>
      </View>
      {/* 投与量入力エリア */}
      <View style={styles.inputRow}>
        <Text style={styles.inlineText}>投与量:</Text>
        <View style={styles.numberInputContainer}>
          <View style={styles.buttonRow}>
            {/* 投与量を10倍刻みで増やすボタン */}
            <IconButton
              icon={({ color }) => (
                <Text style={[styles.doubleIcon, { color }]}>++</Text>
            )}
            size={20}
            onPress={() =>
              handleDoseChange(dose + configs[drug].doseStep * 10)
            }
          />
          <IconButton
            icon="plus"
            size={20}
            onPress={() => handleDoseChange(dose + configs[drug].doseStep)}
          />
        </View>
        <TextInput
          mode="outlined"
          style={styles.numberInput}
          keyboardType="numeric"
          value={String(dose)}
          onChangeText={(v) => {
            const n = Number(v);
            if (!Number.isNaN(n)) {
              handleDoseChange(n);
            }
          }}
        />
          <View style={styles.buttonRow}>
            {/* 投与量を10倍刻みで減らすボタンを左に配置 */}
            <IconButton
              icon={({ color }) => (
                <Text style={[styles.doubleIcon, { color }]}>--</Text>
              )}
              size={20}
              onPress={() =>
                handleDoseChange(dose - configs[drug].doseStep * 10)
              }
            />
            <IconButton
              icon="minus"
              size={20}
              onPress={() => handleDoseChange(dose - configs[drug].doseStep)}
            />
          </View>
        </View>
        <Text style={styles.inlineText}>µg/kg/min</Text>
      </View>
      <PaperSlider
        style={styles.slider}
        value={dose}
        onValueChange={handleDoseChange}
        minimumValue={doseRange.min}
        maximumValue={doseRange.max}
        dangerThreshold={configs[drug].dangerDose}
        step={configs[drug].doseStep}
      />
      {/* 溶質量・単位・溶液量を横並びで入力する */}
      <View style={styles.compositionRow}>
        {/* ラベルと入力欄を一行に配置する */}
        <Text style={styles.label}>組成:</Text>
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
      {/* 流量入力エリア */}
      <View style={styles.rateRow}>
        <Text style={styles.label}>流量:</Text>
        <View style={styles.numberInputContainer}>
          <View style={styles.buttonRow}>
            {/* 流量を10倍刻みで増やすボタン */}
            <IconButton
              icon={({ color }) => (
                <Text style={[styles.doubleIcon, { color }]}>++</Text>
            )}
            size={20}
            onPress={() =>
              handleRateChange(rate + configs[drug].rateStep * 10)
            }
          />
          <IconButton
            icon="plus"
            size={20}
            onPress={() => handleRateChange(rate + configs[drug].rateStep)}
          />
        </View>
        <TextInput
          mode="outlined"
          style={styles.numberInput}
          keyboardType="numeric"
          value={String(rate)}
          onChangeText={(v) => {
            const n = Number(v);
            if (!Number.isNaN(n)) {
              handleRateChange(n);
            }
          }}
        />
        <Text style={styles.inlineText}>ml/hr</Text>
        <View style={styles.buttonRow}>
          {/* 流量を10倍刻みで減らすボタンを左に配置 */}
          <IconButton
            icon={({ color }) => (
              <Text style={[styles.doubleIcon, { color }]}>--</Text>
            )}
            size={20}
            onPress={() =>
              handleRateChange(rate - configs[drug].rateStep * 10)
            }
          />
          <IconButton
            icon="minus"
            size={20}
            onPress={() => handleRateChange(rate - configs[drug].rateStep)}
          />
        </View>
        </View>
      </View>
      <PaperSlider
        style={styles.slider}
        value={rate}
        onValueChange={handleRateChange}
        minimumValue={rateRange.min}
        maximumValue={rateRange.max}
        step={configs[drug].rateStep}
      />
      {/* 薬剤の説明を最下部に表示 */}
      <Text style={styles.description}>{configs[drug].description}</Text>
      {/* Snackbar でバリデーションメッセージを表示 */}
        <Snackbar
          visible={snackbar.length > 0}
          onDismiss={() => setSnackbar('')}
          duration={2000}
        >
          {snackbar}
        </Snackbar>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // スクロールコンテナでは flexGrow を指定して中央寄せにする
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  container: {
    alignItems: 'center',
  },
  // PaperSlider のコンテナに適用する共通スタイル
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
  // ラベルと入力エリアを横並びに配置する
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    marginTop: 12,
  },
  // 薬剤説明用テキストのスタイル
  description: {
    fontSize: 12,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  // 数値入力と増減ボタン用の縦並びコンテナ
  numberInputContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  // 増減ボタンを横並びに配置する行
  buttonRow: {
    flexDirection: 'row',
  },
  // 体重や投与量などを直接入力するテキストボックス
  numberInput: {
    width: 80,
    textAlign: 'center',
  },
  // 流量ラベルと入力欄を横並びに配置する行
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // 10倍増減ボタン用のテキストスタイル
  doubleIcon: {
    fontSize: 12,
  },
  // ラベルと入力欄を横並びに表示する行
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
});
