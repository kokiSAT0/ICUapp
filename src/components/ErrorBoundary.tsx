import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Snackbar } from 'react-native-paper';

// ErrorBoundary が受け取るプロパティの型
export type ErrorBoundaryProps = {
  children: React.ReactNode; // ラップする子要素
};

// 内部状態の型: エラー発生有無だけを持つ
export type ErrorBoundaryState = {
  hasError: boolean;
};

// React.Component を継承してエラー境界を実装
export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // エラーが発生していない状態で初期化
    this.state = { hasError: false };
  }

  // 子コンポーネントでエラーが起きたときに呼び出される
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // 開発時に内容を確認できるようコンソールへ出力
    console.error('ErrorBoundary caught', error, info);
    // 画面では再起動を促すため hasError を true にする
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      // Snackbar を使ってユーザーに再起動を促す
      return (
        <View style={styles.container}>
          <Snackbar visible onDismiss={() => {}}>
            問題が発生しました。アプリを再起動してください。
          </Snackbar>
        </View>
      );
    }
    // エラーがなければそのまま子要素を表示
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
