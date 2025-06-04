import React from 'react';
import { StatusBar } from 'expo-status-bar';
// StyleSheet はコンポーネントの見た目を整えるためのオブジェクトを生成する
import { StyleSheet } from 'react-native';
// SafeAreaProvider と SafeAreaView は端末のノッチ部分などを考慮した表示を行う
// ライブラリ react-native-safe-area-context から提供される
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// PaperProvider はテーマ設定を提供する
import { Provider as PaperProvider } from 'react-native-paper';
import FlowRateConverter from './src/components/FlowRateConverter';

// アプリのエントリーポイント
export type AppProps = {};

export default function App(_: AppProps) {
  return (
    // SafeAreaProvider でアプリ全体をラップし安全な表示領域を計算させる
    <SafeAreaProvider>
      <PaperProvider>
        <SafeAreaView style={styles.container}>
          {/* γ計算のみを行うシンプルな画面 */}
          <StatusBar style="auto" />
          <FlowRateConverter />
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
