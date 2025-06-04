import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
// PaperProvider はテーマ設定を提供する
import { Provider as PaperProvider } from 'react-native-paper';
import FlowRateConverter from './src/components/FlowRateConverter';

// アプリのエントリーポイント
export type AppProps = {};

export default function App(_: AppProps) {
  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        {/* γ計算のみを行うシンプルな画面 */}
        <StatusBar style="auto" />
        <FlowRateConverter />
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
