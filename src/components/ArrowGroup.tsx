import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';

type Props = {
  onInc: () => void;
  onDec: () => void;
};

/** ▲▼ ボタンを左右に配置しただけの単純コンポーネント */
export default function ArrowGroup({ onInc, onDec }: Props) {
  return (
    <View style={styles.container}>
      <IconButton icon="chevron-up" size={24} onPress={onInc} />
      <IconButton icon="chevron-down" size={24} onPress={onDec} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 4,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 48,
  },
});
