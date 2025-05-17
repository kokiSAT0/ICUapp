import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

// アプリのエントリーポイント
export default function App() {
  return (
    <>
      {/* ナビゲーションコンポーネントを呼び出す */}
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}
