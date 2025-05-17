import React from 'react';
import { View, Text, Button, ScrollView } from 'react-native';

// ホーム画面では各ツールへのリンクを表示します
export default function HomeScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>ICU ツール集</Text>
      {/* ボタンで各ツール画面へ遷移予定 */}
      <Button title="流量計算" onPress={() => navigation.navigate('Flow')} />
      <Button title="GCS 計算" onPress={() => navigation.navigate('GCS')} />
      <Button title="RASS 計算" onPress={() => navigation.navigate('RASS')} />
      <Button title="SOFA 計算" onPress={() => navigation.navigate('SOFA')} />
      <Button title="APACHE 計算" onPress={() => navigation.navigate('APACHE')} />
    </ScrollView>
  );
}
