import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import DrugConfigSnackbar from '@/components/DrugConfigSnackbar';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

// 画面遷移時に渡されるパラメータの型
export type WebViewScreenParams = {
  uri: string;
};

// 画面コンポーネントのプロパティ型
export type WebViewScreenProps = {
  route: RouteProp<{ params: WebViewScreenParams }, 'params'>;
};

export default function WebViewScreen({ route }: WebViewScreenProps) {
  // ナビゲーションオブジェクトを取得
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Appbar はヘッダーを表示する Paper コンポーネント */}
      <Appbar.Header>
        {/* 戻るボタン */}
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="閲覧" />
      </Appbar.Header>
      {/* WebView で PDF や Web ページを表示 */}
      <WebView source={{ uri: route.params.uri }} style={styles.webview} />
      {/* 共有エラーメッセージ用 */}
      <DrugConfigSnackbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
});
