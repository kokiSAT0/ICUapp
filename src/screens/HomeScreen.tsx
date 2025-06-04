import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

export type HomeScreenProps = { navigation: any };

// ホーム画面では各ツールへのリンクを表示します
export default function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>ICU ツール集</Text>
      {/* ボタンで各ツール画面へ遷移予定 */}
      <Button mode="contained" onPress={() => navigation.navigate('Flow')}>流量計算</Button>
      <Button mode="contained" onPress={() => navigation.navigate('GCS')}>GCS 計算</Button>
      <Button mode="contained" onPress={() => navigation.navigate('RASS')}>RASS 計算</Button>
      <Button mode="contained" onPress={() => navigation.navigate('SOFA')}>SOFA 計算</Button>
      <Button mode="contained" onPress={() => navigation.navigate('APACHE')}>APACHE 計算</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
});
