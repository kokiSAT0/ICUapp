import React from 'react';
import renderer from 'react-test-renderer';
// React Native を簡易モックしてテスト実行を容易にする
jest.mock('react-native', () => ({
  View: 'View',
  StyleSheet: { create: () => ({}) },
}));
// Snackbar コンポーネントもプレーンな文字列でモック
jest.mock('react-native-paper', () => ({
  Snackbar: 'Snackbar',
}));
import ErrorBoundary from '../src/components/ErrorBoundary';
import { Snackbar } from 'react-native-paper';

function ProblemChild() {
  throw new Error('boom');
}

test('ErrorBoundary catches error and shows message', () => {
  let tree: renderer.ReactTestRenderer;
  // act でレンダー処理をまとめて実行
  renderer.act(() => {
    tree = renderer.create(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );
  });
  // Snackbar が表示されているか確認
  const snackbar = tree!.root.findByType(Snackbar);
  expect(snackbar.props.children).toBe(
    '問題が発生しました。アプリを再起動してください。',
  );
});
