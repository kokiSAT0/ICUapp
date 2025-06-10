import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import GammaCalculatorScreen, {
  type GammaCalculatorScreenProps,
} from '@/screens/GammaCalculatorScreen';

export default function App() {
  // Digital-7 フォントの読み込み
  const [fontsLoaded] = useFonts({
    DSEG7Classic: require('./assets/fonts/DSEG7Classic.ttf'),
  });
  if (!fontsLoaded) return null; // 読込完了まで待機

  // 型を適用した画面コンポーネントを用意
  const GammaScreen =
    GammaCalculatorScreen as React.ComponentType<GammaCalculatorScreenProps>;

  return (
    <PaperProvider>
      <SafeAreaProvider>
        {/* ステータスバーと重ならないよう SafeArea 内に配置 */}
        <StatusBar style="dark" />
        {/* 型を適用したコンポーネントを表示 */}
        <GammaScreen />
      </SafeAreaProvider>
    </PaperProvider>
  );
}
