import React from "react";
// StyleSheet はコンポーネントの見た目を整えるためのオブジェクトを生成する
import { StyleSheet } from "react-native";
// PaperProvider はテーマ設定を提供する
import { Provider as PaperProvider } from "react-native-paper";
// ジェスチャー操作を有効にするラッパービュー
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import SettingsScreen from "./src/components/SettingsScreen";
import GammaCalculatorScreen, {
  type GammaCalculatorScreenProps,
} from "./src/screens/GammaCalculatorScreen";
import { DrugConfigProvider } from "./src/contexts/DrugConfigContext";
import ErrorBoundary from "./src/components/ErrorBoundary";
import mobileAds from "react-native-google-mobile-ads";

// アプリのエントリーポイント
export type AppProps = {};

const Stack = createNativeStackNavigator();

export default function App(_: AppProps) {
  // Expo フォント読み込み。読み込みが完了するまで null を返して待機
  const [fontsLoaded] = useFonts({
    DSEG7Classic: require("./assets/fonts/DSEG7Classic.ttf"),
  });
  // フックは常に同じ順序で呼び出す必要があるため、
  // フォントが未読込みの場合でも useEffect を先に宣言しておく
  React.useEffect(() => {
    if (fontsLoaded) {
      // AdMob SDK を初期化する
      mobileAds().initialize();
    }
  }, [fontsLoaded]);

  // フォント読込みが終わるまでは何も表示しない
  if (!fontsLoaded) return null;

  return (
    // GestureHandlerRootView でジェスチャー操作を有効化する
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="dark" />
      {/* SafeAreaProvider でノッチ等を考慮したレイアウトを実現 */}
      <SafeAreaProvider>
        {/* PaperProvider は内部で SafeAreaProvider をラップしている */}
        <DrugConfigProvider>
          <PaperProvider>
            <ErrorBoundary>
              <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                  {/* ホーム画面を GammaCalculatorScreen に変更 */}
                  <Stack.Screen
                    name="Home"
                    component={
                      GammaCalculatorScreen as React.ComponentType<GammaCalculatorScreenProps>
                    }
                  />
                  <Stack.Screen
                    name="Settings"
                    component={SettingsScreenWrapper}
                    options={{
                      title: "設定",
                      // スワイプ操作で前の画面へ戻れるようにする
                      gestureEnabled: true,
                    }}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </ErrorBoundary>
          </PaperProvider>
        </DrugConfigProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// SettingsScreen はスタック内から閉じた際に navigate.goBack を呼び出す
function SettingsScreenWrapper({ navigation }: { navigation: any }) {
  return <SettingsScreen onClose={() => navigation.goBack()} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
