import React from 'react';
import { StatusBar } from 'expo-status-bar';
// StyleSheet はコンポーネントの見た目を整えるためのオブジェクトを生成する
import { StyleSheet } from 'react-native';
// SafeAreaProvider と SafeAreaView は端末のノッチ部分などを考慮した表示を行う
// ライブラリ react-native-safe-area-context から提供される
import { SafeAreaView } from 'react-native-safe-area-context';
// PaperProvider はテーマ設定を提供する
import { Provider as PaperProvider, IconButton } from 'react-native-paper';
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
    // PaperProvider は内部で SafeAreaProvider をラップしている
    <DrugConfigProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Home"
              component={FlowRateConverter}
              options={({ navigation }) => ({
                title: '投与量・流量換算ツール',
                headerRight: () => (
                  <IconButton
                    icon="cog"
                    onPress={() => navigation.navigate('Settings')}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreenWrapper}
              options={{ title: '設定' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </DrugConfigProvider>
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
