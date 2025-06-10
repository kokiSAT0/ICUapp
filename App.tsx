import React from 'react';
// StyleSheet はコンポーネントの見た目を整えるためのオブジェクトを生成する
import { StyleSheet } from 'react-native';
// PaperProvider はテーマ設定を提供する
import { Provider as PaperProvider } from 'react-native-paper';
// ジェスチャー操作を有効にするラッパービュー
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FlowRateConverter from './src/components/FlowRateConverter';
import SettingsScreen from './src/components/SettingsScreen';
import { DrugConfigProvider } from './src/contexts/DrugConfigContext';

// アプリのエントリーポイント
export type AppProps = {};

const Stack = createNativeStackNavigator();

export default function App(_: AppProps) {
  return (
    // GestureHandlerRootView でジェスチャー操作を有効化する
    <GestureHandlerRootView style={styles.container}>
      {/* PaperProvider は内部で SafeAreaProvider をラップしている */}
      <DrugConfigProvider>
        <PaperProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Home" component={FlowRateConverter} />
              <Stack.Screen
                name="Settings"
                component={SettingsScreenWrapper}
                options={{ title: '設定' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </DrugConfigProvider>
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
