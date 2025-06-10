import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  Appbar,
  Text,
  Surface,
  IconButton,
  Button,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import PaperSlider from './PaperSlider';

export type NewMainScreenProps = {};

export type DigitCardProps = {
  value: number;
  unit: string;
  onChange: (digit: number, delta: number) => void;
  bgColor: string;
  footer?: React.ReactNode;
};

function DigitCard({ value, unit, onChange, bgColor, footer }: DigitCardProps) {
  const [intPart, decPart] = value.toFixed(2).split('.');

  const renderDigit = (digit: number, char: string) => (
    <View key={digit} style={styles.digitCol}>
      <IconButton icon="chevron-up" size={16} onPress={() => onChange(digit, +1)} />
      <Text style={styles.digit}>{char}</Text>
      <IconButton icon="chevron-down" size={16} onPress={() => onChange(digit, -1)} />
    </View>
  );

  return (
    <Surface style={[styles.rateCard, { backgroundColor: bgColor }]}>
      <View style={styles.digitsRow}>
        {intPart.split('').reverse().map((c, idx) => renderDigit(idx, c)).reverse()}
        <Text style={[styles.digit, styles.dot]}>.</Text>
        {decPart.split('').map((c, idx) => renderDigit(-idx - 1, c))}
        <Text style={styles.unit}>{unit}</Text>
      </View>
      {footer}
    </Surface>
  );
}

export default function NewMainScreen(_: NewMainScreenProps) {
  const [doseMg, setDoseMg] = useState(2);
  const [doseMl, setDoseMl] = useState(20);
  const [weight, setWeight] = useState(60);
  const [rateMlH, setRateMlH] = useState(33.8);
  const [rateGamma, setRateGamma] = useState(0.88);
  const MAX_GAMMA = 0.7;

  const [editing, setEditing] = useState<null | 'doseMg' | 'doseMl' | 'weight'>(null);
  const [tmpValue, setTmpValue] = useState('');

  const addDigit = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number,
    digit: number,
    delta: number,
  ) => {
    const factor = Math.pow(10, digit);
    const newVal = Math.round((value + delta * factor) * 10) / 10;
    setter(newVal < 0 ? 0 : newVal);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="ノルアドレナリン" />
        <Appbar.Action icon="cog" onPress={() => {}} />
      </Appbar.Header>

      <Surface style={styles.compCard}>
        <Text style={styles.compLine}>
          組成：
          <Button
            mode="outlined"
            onPress={() => {
              setEditing('doseMg');
              setTmpValue(String(doseMg));
            }}
          >
            {doseMg}
          </Button>
          mg /
          <Button
            mode="outlined"
            onPress={() => {
              setEditing('doseMl');
              setTmpValue(String(doseMl));
            }}
          >
            {doseMl}
          </Button>
          ml
        </Text>
        <Text style={styles.compLine}>濃度：{((doseMg * 1000) / doseMl).toFixed(0)}µg/ml</Text>
        <Text style={styles.compLine}>
          体重
          <Button
            mode="outlined"
            onPress={() => {
              setEditing('weight');
              setTmpValue(String(weight));
            }}
            style={{ marginHorizontal: 4 }}
          >
            {weight}
          </Button>
          kg
        </Text>
      </Surface>

      <DigitCard
        value={rateMlH}
        unit="ml/h"
        onChange={(digit, delta) => addDigit(setRateMlH, rateMlH, digit, delta)}
        bgColor="#dff6f7"
      />

      <DigitCard
        value={rateGamma}
        unit="γ"
        onChange={(digit, delta) => addDigit(setRateGamma, rateGamma, digit, delta * 0.01)}
        bgColor="#e6f8e9"
        footer={
          <View style={styles.sliderBox}>
            <Text style={styles.sliderEdge}>0</Text>
            <PaperSlider
              style={{ flex: 1 }}
              minimumValue={0}
              maximumValue={MAX_GAMMA}
              value={rateGamma}
              onValueChange={setRateGamma}
            />
            <Text style={styles.sliderEdge}>{MAX_GAMMA}γ</Text>
          </View>
        }
      />

      <Surface style={styles.docCard}>
        <Text style={{ color: '#666' }}>（ここに添付文書の内容を表示）</Text>
      </Surface>

      <Portal>
        <Modal visible={editing !== null} onDismiss={() => setEditing(null)}>
          <Surface style={styles.modal}>
            <Text style={styles.modalLabel}>新しい値を入力してください</Text>
            <TextInput
              mode="outlined"
              keyboardType="numeric"
              value={tmpValue}
              onChangeText={setTmpValue}
              style={styles.modalInput}
            />
            <View style={styles.modalBtns}>
              <Button
                mode="contained"
                onPress={() => {
                  const v = parseFloat(tmpValue);
                  if (!Number.isNaN(v)) {
                    if (editing === 'doseMg') setDoseMg(v);
                    if (editing === 'doseMl') setDoseMl(v);
                    if (editing === 'weight') setWeight(v);
                  }
                  setEditing(null);
                }}
              >
                OK
              </Button>
              <Button mode="outlined" onPress={() => setEditing(null)}>
                キャンセル
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  compCard: {
    backgroundColor: '#d1d1d1',
    borderRadius: 12,
    padding: 12,
  },
  compLine: {
    fontSize: 18,
    marginVertical: 4,
  },
  rateCard: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  digitsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  digitCol: {
    alignItems: 'center',
  },
  digit: {
    fontFamily: 'monospace',
    fontSize: 64,
    lineHeight: 70,
    color: '#333',
    paddingHorizontal: 2,
  },
  dot: {
    fontSize: 56,
    lineHeight: 70,
  },
  unit: {
    fontFamily: 'monospace',
    fontSize: 28,
    marginLeft: 4,
    alignSelf: 'flex-end',
    marginBottom: 6,
  },
  sliderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  sliderEdge: {
    width: 46,
    textAlign: 'center',
    fontSize: 18,
  },
  docCard: {
    height: 240,
    backgroundColor: '#d9d9d9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  modal: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalLabel: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalInput: {
    fontSize: 20,
    textAlign: 'center',
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 16,
  },
});

