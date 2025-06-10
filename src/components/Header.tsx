import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';

// ヘッダー用コンポーネントのプロパティ型
export type HeaderProps = {
  // 設定ボタンが押されたときの処理
  onPressSettings: () => void;
};

export default function Header({ onPressSettings }: HeaderProps) {
  return (
    <View style={styles.container}>
      {/* 中央にピル型ボタンを配置 */}
      <Button mode="contained" style={styles.centerButton} compact>
        メニュー
      </Button>
      {/* 右端に設定アイコンを配置 */}
      <IconButton icon="cog" onPress={onPressSettings} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  centerButton: {
    borderRadius: 20,
  },
});
