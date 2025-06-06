import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Surface, Text, TextInput, Button, Menu, Snackbar } from 'react-native-paper';
import { useDrugConfigs } from '../contexts/DrugConfigContext';
import { DrugType } from '../config/drugs';

export type SettingsScreenProps = {
  onClose: () => void;
};

export default function SettingsScreen({ onClose }: SettingsScreenProps) {
  const { configs, setConfigs, resetToDefault } = useDrugConfigs();
  const [localConfigs, setLocalConfigs] = useState(configs);
  const [snackbar, setSnackbar] = useState('');
  const [menuVisible, setMenuVisible] = useState<DrugType | null>(null);

  // 入力値更新用ヘルパー
  const updateValue = (
    drug: DrugType,
    key: keyof typeof configs[DrugType extends never ? never : DrugType],
    value: string,
  ) => {
    const numKeys: Array<keyof typeof configs[DrugType extends never ? never : DrugType]> = [
      'initialDose',
      'soluteAmount',
      'solutionVolume',
    ];
    setLocalConfigs({
      ...localConfigs,
      [drug]: {
        ...localConfigs[drug],
        [key]: numKeys.includes(key)
          ? Number(value)
          : value,
      },
    });
  };

  const handleSave = async () => {
    await setConfigs(localConfigs);
    setSnackbar('保存しました');
    onClose();
  };

  const handleReset = async () => {
    await resetToDefault();
    setLocalConfigs(configs);
    setSnackbar('デフォルトに戻しました');
  };

  return (
    <Surface style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {Object.keys(localConfigs).map((drugKey) => {
          const key = drugKey as DrugType;
          const cfg = localConfigs[key];
          return (
            <View key={key} style={styles.section}>
              <Text style={styles.heading}>{cfg.label}</Text>
              <TextInput
                mode="outlined"
                label="初期投与量(µg/kg/min)"
                style={styles.input}
                keyboardType="numeric"
                value={String(cfg.initialDose)}
                onChangeText={(v) => updateValue(key, 'initialDose', v)}
              />
              <View style={styles.row}>
                <TextInput
                  mode="outlined"
                  label="溶質量"
                  style={styles.smallInput}
                  keyboardType="numeric"
                  value={String(cfg.soluteAmount)}
                  onChangeText={(v) => updateValue(key, 'soluteAmount', v)}
                />
                <Menu
                  visible={menuVisible === key}
                  onDismiss={() => setMenuVisible(null)}
                  anchor={<Button onPress={() => setMenuVisible(key)}>{cfg.soluteUnit}</Button>}
                >
                  <Menu.Item onPress={() => updateValue(key, 'soluteUnit', 'mg')} title="mg" />
                  <Menu.Item onPress={() => updateValue(key, 'soluteUnit', 'µg')} title="µg" />
                </Menu>
                <Text style={styles.inlineText}>/</Text>
                <TextInput
                  mode="outlined"
                  label="溶液量(ml)"
                  style={styles.smallInput}
                  keyboardType="numeric"
                  value={String(cfg.solutionVolume)}
                  onChangeText={(v) => updateValue(key, 'solutionVolume', v)}
                />
              </View>
            </View>
          );
        })}
        <View style={styles.buttonRow}>
          <Button mode="contained" onPress={handleSave} style={styles.button}>
            保存
          </Button>
          <Button mode="outlined" onPress={handleReset} style={styles.button}>
            デフォルトに戻す
          </Button>
        </View>
        <Button onPress={onClose} style={styles.closeButton}>閉じる</Button>
      </ScrollView>
      <Snackbar visible={snackbar.length > 0} onDismiss={() => setSnackbar('')}>{snackbar}</Snackbar>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 16 },
  section: { marginBottom: 24 },
  heading: { fontSize: 16, marginBottom: 8 },
  input: { marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  smallInput: { width: 80, marginRight: 8 },
  inlineText: { marginHorizontal: 4, fontSize: 14 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  button: { marginHorizontal: 4 },
  closeButton: { marginTop: 16 },
});
