import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Button, useTheme } from 'react-native-paper';

export const HeaderBar = () => {
  const theme = useTheme();
  return (
    <>
      <View style={styles.container}>
        <Button mode="contained-tonal" style={styles.centerBtn} onPress={() => {}}>
          ノルアドレナリン
        </Button>
        <IconButton icon="cog-outline" size={28} onPress={() => {}} />
      </View>
      <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingBottom: 4,
    columnGap: 8,
  },
  centerBtn: { flexGrow: 1 },
  separator: { height: 1, width: '100%' },
});
