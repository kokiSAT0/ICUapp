import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Surface,
  Text,
  Button,
  IconButton,
  Divider,
} from 'react-native-paper';
import PaperSlider from './PaperSlider';

// 画面用のプロパティ型。今回は特別な引数はない
export type GammaCalculatorScreenProps = {};

// 最大 γ は実臨床で 0.7 γ/h と仮置き
const MAX_GAMMA = 0.7;

export default function GammaCalculatorScreen(_: GammaCalculatorScreenProps) {
  // 状態は最小構成としてサンプル値を保持
  const [drug] = useState('ノルアドレナリン');
  const [mg, setMg] = useState(2);
  const [ml, setMl] = useState(20);
  const [weight, setWeight] = useState(60);
  const [flowRate, setFlowRate] = useState(38.8); // ml/h
  const [gamma, setGamma] = useState(0.28);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ヘッダー部分。薬剤ボタンと設定ボタンを配置 */}
      <Surface style={styles.header}>
        <Button mode="contained-tonal" style={styles.drugButton} onPress={() => {}}>
          {drug}
        </Button>
        <IconButton
          icon="cog"
          style={styles.settingButton}
          size={28}
          onPress={() => {}}
        />
      </Surface>
      <Divider style={styles.headerDivider} />

      {/* 画面が長くなった場合に備えて ScrollView でラップ */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* 組成と体重をまとめたカード */}
        <Surface style={styles.cardGrey}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>組成：</Text>
            <Button onPress={() => setMg(mg + 1)} style={styles.valueBox}>
              <Text style={styles.valueBoxText}>{mg}</Text>
            </Button>
            <Text style={styles.unitText}>mg /</Text>
            <Button onPress={() => setMl(ml + 1)} style={styles.valueBox}>
              <Text style={styles.valueBoxText}>{ml}</Text>
            </Button>
            <Text style={styles.unitText}>ml</Text>
            <View style={styles.spacer} />
            <Text style={styles.label}>体重</Text>
            <Button onPress={() => setWeight(weight + 1)} style={styles.valueBox}>
              <Text style={styles.valueBoxText}>{weight}</Text>
            </Button>
            <Text style={[styles.unitText, { marginRight: 0 }]}>kg</Text>
          </View>
          <Text style={styles.densityText}>濃度：{(mg * 1000) / ml} µg/ml</Text>
        </Surface>

        {/* 流量表示カード (ml/h) */}
        <FlowDisplayCard
          title="ml/h"
          value={flowRate}
          decimals={1}
          backgroundColor="#e2f9fc"
          onIncrement={() => setFlowRate(prev => +(prev + 0.1).toFixed(1))}
          onDecrement={() => setFlowRate(prev => Math.max(0, +(prev - 0.1).toFixed(1)))}
        />

        {/* 流量表示カード (γ) */}
        <FlowDisplayCard
          title="γ"
          value={gamma}
          decimals={2}
          backgroundColor="#e6fbee"
          onIncrement={() => setGamma(prev => +(prev + 0.01).toFixed(2))}
          onDecrement={() => setGamma(prev => Math.max(0, +(prev - 0.01).toFixed(2)))}
        >
          {/* 値をスライダーでも調整できるようにする */}
          <View style={styles.sliderContainer}>
            <PaperSlider
              style={{ flex: 1 }}
              minimumValue={0}
              maximumValue={MAX_GAMMA}
              value={gamma}
              onValueChange={setGamma}
            />
            <View style={styles.sliderLabelRow}>
              <Text style={styles.sliderEdgeLabel}>0</Text>
              <Text style={styles.sliderEdgeLabel}>{MAX_GAMMA}γ</Text>
            </View>
          </View>
        </FlowDisplayCard>

        {/* 添付文書表示用のカード。ここでは仮置き */}
        <Surface style={styles.cardGrey}>
          <Text style={styles.attachLabel}>添付文書</Text>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

// FlowDisplayCard 用の型定義
export type FlowDisplayCardProps = {
  title: string;
  value: number;
  decimals: 0 | 1 | 2;
  backgroundColor: string;
  onIncrement: () => void;
  onDecrement: () => void;
  children?: React.ReactNode;
};

function FlowDisplayCard({
  title,
  value,
  decimals,
  backgroundColor,
  onIncrement,
  onDecrement,
  children,
}: FlowDisplayCardProps) {
  const formatted = value.toFixed(decimals);

  return (
    <Surface style={[styles.flowCard, { backgroundColor }]}>
      <View style={styles.iconRow}>
        {formatted.split('').map((char, idx) => (
          <IconButton
            key={`u-${idx}`}
            icon="chevron-up"
            size={28}
            onPress={onIncrement}
            disabled={char === '.'}
          />
        ))}
      </View>

      <View style={styles.digitalBox}>
        <Text style={styles.digitalText}>{formatted}</Text>
        <Text style={styles.flowUnit}>{title}</Text>
      </View>

      <View style={styles.iconRow}>
        {formatted.split('').map((char, idx) => (
          <IconButton
            key={`d-${idx}`}
            icon="chevron-down"
            size={28}
            onPress={onDecrement}
            disabled={char === '.'}
          />
        ))}
      </View>
      {children}
    </Surface>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#c8f1ef',
  },
  drugButton: {
    paddingVertical: 6,
    paddingHorizontal: 24,
  },
  settingButton: {
    position: 'absolute',
    right: 12,
  },
  headerDivider: {
    height: 2,
    backgroundColor: '#0089a7',
  },
  cardGrey: {
    width: '100%',
    backgroundColor: '#dcdcdc',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  densityText: {
    marginTop: 4,
    fontSize: 14,
  },
  unitText: {
    fontSize: 14,
    marginHorizontal: 4,
  },
  valueBox: {
    marginHorizontal: 2,
  },
  valueBoxText: {
    fontSize: 18,
    fontWeight: '600',
  },
  spacer: { flex: 1 },
  flowCard: {
    width: '100%',
    borderRadius: 12,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  digitalBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginVertical: 4,
    backgroundColor: '#dbd8d8',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  digitalText: {
    fontSize: 64,
    letterSpacing: -4,
  },
  flowUnit: {
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 4,
    marginBottom: 10,
  },
  sliderContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -2,
  },
  sliderEdgeLabel: {
    fontSize: 14,
  },
  attachLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
});

