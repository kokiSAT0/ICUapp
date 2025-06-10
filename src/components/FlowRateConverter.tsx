import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Platform,
  ToastAndroid,
  Alert,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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
import { DIGIT_SPACING } from './DigitalNumber';
import Header from './Header';
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

// 投与量の単位が hr 指定の場合は分単位へ変換する
function toMinuteDose(dose: number, unit: string): number {
  return unit === 'µg/kg/hr' ? dose / 60 : dose;
}

// 分単位から表示単位へ戻す
function fromMinuteDose(dose: number, unit: string): number {
  return unit === 'µg/kg/hr' ? dose * 60 : dose;
}

// 各ダイアルの設定値
const WEIGHT_MIN = 20;
const WEIGHT_MAX = 120;
// 体重を保存する際のキー名
const STORAGE_KEY_WEIGHT = 'weight';
// 画面高さを取得して説明カードの高さに利用
const SCREEN_HEIGHT = Dimensions.get('window').height;
export type Range = {
  min: number;
  max: number;
};

export type FlowRateConverterProps = {};

// メインコンポーネント
export default function FlowRateConverter(_: FlowRateConverterProps) {
  const navigation = useNavigation<any>();
  // 初期値: 体重50kg、薬剤ごとの設定に基づく投与量
  // 表示順の先頭薬剤をデフォルトとする
  const { configs, drugOrder } = useDrugConfigs();
  const [drug, setDrug] = useState<DrugType>(drugOrder[0]);

  // 表示順が変更された場合に初期薬剤を合わせる
  useEffect(() => {
    setDrug(drugOrder[0]);
  }, [drugOrder]);
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
  // drugOrder の先頭要素を基に初期設定を取得
  const defaultCfg = configs[drugOrder[0]];
  const [dose, setDose] = useState(defaultCfg.initialDose);
  // 投与量・流量の範囲を薬剤ごとに保持
  const [doseRange, setDoseRange] = useState<Range>({
    min: defaultCfg.doseMin,
    max: defaultCfg.doseMax,
  });
  const [rateRange, setRateRange] = useState<Range>({
    min: convertDoseToRate(
      toMinuteDose(defaultCfg.doseMin, defaultCfg.doseUnit),
      50,
      computeConcentration(
        defaultCfg.soluteAmount,
        defaultCfg.soluteUnit,
        defaultCfg.solutionVolume,
      ),
    ),
    max: convertDoseToRate(
      toMinuteDose(defaultCfg.doseMax, defaultCfg.doseUnit),
      50,
      computeConcentration(
        defaultCfg.soluteAmount,
        defaultCfg.soluteUnit,
        defaultCfg.solutionVolume,
      ),
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
        toMinuteDose(defaultCfg.initialDose, defaultCfg.doseUnit),
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
  // 並び順を保ったまま表示対象のみ抽出
  const enabledDrugs = drugOrder.filter((k) => configs[k].enabled);

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
      convertDoseToRate(
        toMinuteDose(d, info.doseUnit),
        weight,
        conc,
      ),
      info.rateStep,
    );
    const minRate = convertDoseToRate(
      toMinuteDose(info.doseMin, info.doseUnit),
      weight,
      conc,
    );
    const maxRate = convertDoseToRate(
      toMinuteDose(info.doseMax, info.doseUnit),
      weight,
      conc,
    );
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
      min: roundStep(
        convertDoseToRate(
          toMinuteDose(range.min, configs[drug].doseUnit),
          w,
          conc,
        ),
        step,
      ),
      max: roundStep(
        convertDoseToRate(
          toMinuteDose(range.max, configs[drug].doseUnit),
          w,
          conc,
        ),
        step,
      ),
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
      convertDoseToRate(
        toMinuteDose(dose, configs[drug].doseUnit),
        value,
        concentration,
      ),
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
        `投与量は${doseRange.min}\u2013${doseRange.max}${configs[drug].doseUnit}の範囲です`,
      );
      value = Math.max(doseRange.min, Math.min(doseRange.max, value));
    }
    setDose(value);
    const r = roundStep(
      convertDoseToRate(
        toMinuteDose(value, configs[drug].doseUnit),
        weight,
        concentration,
      ),
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
      fromMinuteDose(
        convertRateToDose(value, weight, concentration),
        configs[drug].doseUnit,
      ),
      configs[drug].doseStep,
    );
    if (d < doseRange.min || d > doseRange.max) {
      showToast(
        `投与量は${doseRange.min}\u2013${doseRange.max}${configs[drug].doseUnit}の範囲です`,
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
      convertDoseToRate(
        toMinuteDose(dose, configs[drug].doseUnit),
        weight,
        c,
      ),
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
    <SafeAreaView style={styles.safeArea}>
      <Header onPressSettings={() => navigation.navigate('Settings')} />
      {/* ScrollView で画面からはみ出した場合に縦スクロールできるようにする */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* 薬剤選択と体重入力を横並びに配置 */}
        <View style={styles.drugWeightRow}>
          {/* 薬剤選択をカードに配置 */}
          <Surface style={[styles.card, styles.drugArea]}>
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
          </Surface>

          {/* 体重入力と組成入力を同じカードにまとめる */}
          <Surface style={[styles.card, styles.weightArea]}>
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
            {/* デフォルト値 60kg 設定ボタン */}
            <Button
              mode="contained"
              compact
              buttonColor="#9A9A9A"
              onPress={() => handleWeightChange(60)}
              style={styles.defaultButton}
            >
              60kg
            </Button>
          </View>

          {/* 溶質量・単位・溶液量を横並びで入力する */}
          <View style={styles.compositionRow}>
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
            {/* デフォルト値 2mg / 20ml ボタン */}
            <Button
              mode="contained"
              compact
              buttonColor="#9A9A9A"
              onPress={() => {
                handleAmountChange('2');
                handleVolumeChange('20');
              }}
              style={styles.defaultButton}
            >
              2mg/20ml
            </Button>
          </View>
          {/* 濃度表示 */}
          <Text style={styles.label}>濃度: {concentration.toFixed(0)} µg/ml</Text>
          </Surface>
        </View>

        {/* 流量入力エリア */}
        <Surface style={[styles.card, styles.rateCard]}>
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
                style={[styles.numberInput, styles.largeNumber]}
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
        </Surface>

        {/* 投与量入力エリア */}
        <Surface style={[styles.card, styles.doseCard]}>
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
                style={[styles.numberInput, styles.largeNumber]}
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
            <Text style={styles.inlineText}>{configs[drug].doseUnit}</Text>
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
          <View style={styles.sliderLabelRow}>
            <Text>0</Text>
            <Text>
              {doseRange.max}
              {configs[drug].doseUnit === 'µg/kg/min'
                ? 'γ'
                : configs[drug].doseUnit === 'µg/kg/hr'
                ? 'γ/hr'
                : configs[drug].doseUnit}
            </Text>
          </View>
        </Surface>

        {/* 解説表示エリア: 高さ固定でスクロール可能にする */}
        <Surface style={[styles.card, styles.descriptionCard]}>
          <ScrollView contentContainerStyle={styles.descriptionScroll}>
            <Text style={styles.description}>{configs[drug].description}</Text>
          </ScrollView>
        </Surface>

        {/* Snackbar でバリデーションメッセージを表示 */}
        <Snackbar
          visible={snackbar.length > 0}
          onDismiss={() => setSnackbar('')}
          duration={2000}
        >
          {snackbar}
        </Snackbar>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  // スクロールコンテナでは flexGrow を指定して中央寄せにする
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  container: {
    alignItems: 'center',
    width: '100%',
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
  // 各エリアをカード風に表示する共通スタイル
  card: {
    // 画面いっぱいに広げる
    width: '100%',
    marginVertical: 6,
    marginHorizontal: 15,
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#D0D0D0',
    elevation: 2,
  },

  drugCard: {
    backgroundColor: '#e1f5fe',
  },
  weightCard: {
    backgroundColor: '#fff3e0',
  },
  compositionCard: {
    backgroundColor: '#f1f8e9',
  },
  rateCard: {
    backgroundColor: '#fce4ec',
  },
  doseCard: {
    backgroundColor: '#e8eaf6',
  },
  descriptionCard: {
    backgroundColor: '#eeeeee',
    height: SCREEN_HEIGHT * 0.2,
  },
  // 説明文スクロール用コンテナ
  descriptionScroll: {
    paddingHorizontal: 8,
  },
  // スライダーのラベル行
  sliderLabelRow: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // 薬剤選択と体重入力を横並びにする行
  drugWeightRow: {
    flexDirection: 'row',
    width: '100%',
  },
  // 薬剤選択エリアは幅6割
  drugArea: {
    flex: 6,
    marginRight: 4,
  },
  // 体重入力エリアは幅4割
  weightArea: {
    flex: 4,
    marginLeft: 4,
  },
  // 流量・投与量の数値を大きく表示する
  largeNumber: {
    fontSize: 32,
    fontFamily: 'DSEG7Classic',
    letterSpacing: DIGIT_SPACING,
  },
  // デフォルト設定ボタンのスタイル
  defaultButton: {
    marginLeft: 8,
  },
});
