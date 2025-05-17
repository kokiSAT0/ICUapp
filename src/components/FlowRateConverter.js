import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { convertDoseToRate, convertRateToDose } from '../utils/flowConversion';

// 流量計算コンポーネント
// ノルアドレナリン(2mg/20ml)
// µg/kg/min と ml/hr の相互換算のみを実装しています
export default function FlowRateConverter() {
  const [weight, setWeight] = useState('');
  const [dose, setDose] = useState('');
  const [rate, setRate] = useState('');

  // µg/kg/min から ml/hr へ計算
  const handleToRate = () => {
    const w = parseFloat(weight);
    const d = parseFloat(dose);
    if (!Number.isNaN(w) && !Number.isNaN(d)) {
      const result = convertDoseToRate(d, w);
      // 小数点2桁で表示
      setRate(result.toFixed(2));
    }
  };

  // ml/hr から µg/kg/min へ計算
  const handleToDose = () => {
    const w = parseFloat(weight);
    const r = parseFloat(rate);
    if (!Number.isNaN(w) && !Number.isNaN(r)) {
      const result = convertRateToDose(r, w);
      setDose(result.toFixed(2));
    }
  };

  return (
    <View>
      <Text>ノルアドレナリン(2mg/20ml) 換算ツール</Text>

      <Text>体重(kg)</Text>
      <TextInput
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 8, padding: 4 }}
      />

      <Text>投与量(µg/kg/min)</Text>
      <TextInput
        value={dose}
        onChangeText={setDose}
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 8, padding: 4 }}
      />

      <Text>流量(ml/hr)</Text>
      <TextInput
        value={rate}
        onChangeText={setRate}
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 8, padding: 4 }}
      />

      {/* 換算ボタン */}
      <Button title="→ ml/hr" onPress={handleToRate} />
      <Button title="→ µg/kg/min" onPress={handleToDose} />
    </View>
  );
}
