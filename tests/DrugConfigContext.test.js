import { createRequire } from 'module';
const myRequire = createRequire(import.meta.url);
myRequire('sucrase/register/ts.js');

const React = myRequire('react');
import { jest } from '@jest/globals';

const { DrugConfigProvider, useDrugConfigs } = myRequire('../src/contexts/DrugConfigContext.tsx');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const AsyncStorage = myRequire('@react-native-async-storage/async-storage');

test('保存失敗時に Snackbar が表示される', async () => {
  AsyncStorage.getItem.mockRejectedValueOnce(new Error('fail'));

  let message = '';
  const Display = () => {
    const { snackbar } = useDrugConfigs();
    message = snackbar;
    return null;
  };

  const TestRenderer = myRequire('react-test-renderer');
  const warn = console.warn;
  const error = console.error;
  console.warn = () => {};
  console.error = () => {};

  await TestRenderer.act(async () => {
    TestRenderer.create(
      React.createElement(
        DrugConfigProvider,
        null,
        React.createElement(Display, null)
      )
    );
  });

  console.warn = warn;
  console.error = error;

  expect(message).toBe('設定の読み込みに失敗しました');
});
