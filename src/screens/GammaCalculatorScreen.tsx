import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Surface, Text, Divider } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import DigitalNumber from '@/components/DigitalNumber';
import { IconButton } from 'react-native-paper';
import CompositionDialog from '@/components/CompositionDialog';

import { DIGIT_SPACING } from '@/components/DigitalNumber';   // ← 追加

export type GammaCalculatorScreenProps = {};
export default function GammaCalculatorScreen(_: GammaCalculatorScreenProps) {
  const insets = useSafeAreaInsets();
  // useNavigation を用いて設定画面へ遷移する
  const navigation = useNavigation<any>();

  /* ===== 画面状態 ===== */
  const [doseMg, setDoseMg] = useState(2);
  const [volumeMl, setVolumeMl] = useState(20);
  const [weightKg, setWeightKg] = useState(60);
  // 値編集ダイアログの表示状態
  const [dialogVisible, setDialogVisible] = useState(false);
  const [flowMlH, setFlowMlH] = useState(33.8);
  const [gamma, setGamma] = useState(0.88);
  const gammaMax = 0.7;

  /* === 各桁ごとのインクリメント / デクリメント === */
  // ml/h : 3 桁（10, 1, 0.1）
  const flowSteps  = [10, 1, 0.1];
  // γ    : 4 桁（10, 1, 0.1, 0.01）
  const gammaSteps = [10, 1, 0.1, 0.01];

  const incFlow  = (idx: number) => setFlowMlH(v => +(v + flowSteps[idx]).toFixed(1));
  const decFlow  = (idx: number) => setFlowMlH(v => Math.max(0, +(v - flowSteps[idx]).toFixed(1)));
  const incGamma = (idx: number) => setGamma   (v => +(v + gammaSteps[idx]).toFixed(2));
  const decGamma = (idx: number) => setGamma   (v => Math.max(0, +(v - gammaSteps[idx]).toFixed(2)));

  // ダイアログで保存された値を反映
  const handleSubmitValues = useCallback(
    (dose: number, volume: number, weight: number) => {
      setDoseMg(dose);
      setVolumeMl(volume);
      setWeightKg(weight);
    },
    [],
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        style={{ flex: 1 }}
      >
      {/* ===== Header ===== */}
      <View style={styles.header}>
        {/* 旧換算画面への遷移ボタン */}
        <IconButton
          icon="swap-horizontal"
          size={24}
          style={styles.navBtn}
          onPress={() => navigation.navigate('Converter')}
        />
        <Pressable style={styles.centerButton}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
            ノルアドレナリン
          </Text>
        </Pressable>
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
        <Text> mg / </Text>
        <EditableBox value={volumeMl} onPress={() => setDialogVisible(true)} />
        <Text> ml　体重 </Text>
        <EditableBox value={weightKg} onPress={() => setDialogVisible(true)} />
        <Text> kg</Text>

        <Text style={{ width: '100%', marginTop: 4 }}>
          濃度：{(doseMg * 1000 / volumeMl).toFixed(0)} µg/ml
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
          <Slider
            minimumValue={0}
            maximumValue={gammaMax}
            step={0.01}
            value={gamma}
            onValueChange={setGamma}
            minimumTrackTintColor="green"
            thumbTintColor="black"
          />
          <View style={styles.gammaScale}>
            <Text>0</Text>
            <Text>{gammaMax}γ</Text>
          </View>
        </View>
      </Surface>

      {/* ===== ④ 添付文書 ===== */}
      <Pressable
        onPress={() =>
          navigation.navigate('WebView', {
            uri: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          })
        }
      >
        <Surface elevation={1} style={styles.brochure}>
          <Text variant="bodyMedium" style={{ color: '#666' }}>
            添付文書を表示
          </Text>
        </Surface>
      </Pressable>
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
  // 旧画面へ遷移するボタン
  navBtn: { paddingHorizontal: 8 },
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
  gammaScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brochure: {
    margin: 8,
    height: 220,
    borderRadius: 12,
    backgroundColor: '#d7d7d7',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
