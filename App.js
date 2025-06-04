import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';
import FlowRateConverter from './src/components/FlowRateConverter';

// アプリのエントリーポイント
export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* γ計算のみを行うシンプルな画面 */}
      <StatusBar style="auto" />
      <FlowRateConverter />
    </SafeAreaView>
  );
}
