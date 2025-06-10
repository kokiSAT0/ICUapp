import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Surface,
  Text,
  TextInput,
  Button,
  Menu,
  Snackbar,
  Switch,
  List,
  IconButton,
  Portal,
  Modal,
} from 'react-native-paper';
// リストをドラッグ操作で並び替えるためのコンポーネント
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useDrugConfigs } from '../contexts/DrugConfigContext';
import { DrugType, DRUGS, DrugConfig } from '../config/drugs';

// 数値項目のキー名
type NumericKey = 'initialDose' | 'soluteAmount' | 'solutionVolume';
// 入力用設定データ。数値項目を文字列で保持する
type DrugConfigInput = Omit<DrugConfig, NumericKey> & {
  [K in NumericKey]: string;
};

// DrugConfig から DrugConfigInput へ変換
const toInputConfig = (cfg: DrugConfig): DrugConfigInput => ({
  ...cfg,
  initialDose: String(cfg.initialDose),
  soluteAmount: String(cfg.soluteAmount),
  solutionVolume: String(cfg.solutionVolume),
});

// DrugConfigInput から DrugConfig へ変換
const fromInputConfig = (cfg: DrugConfigInput): DrugConfig => ({
  ...cfg,
  initialDose: parseFloat(cfg.initialDose),
  soluteAmount: parseFloat(cfg.soluteAmount),
  solutionVolume: parseFloat(cfg.solutionVolume),
});

export type SettingsScreenProps = {
  onClose: () => void;
};

export default function SettingsScreen({ onClose }: SettingsScreenProps) {
  const {
    configs,
    setConfigs,
    resetDrugToDefault,
    drugOrder,
    setDrugOrder,
  } = useDrugConfigs();
  // 設定値を文字列に変換したローカルステート
  const [localConfigs, setLocalConfigs] = useState<Record<DrugType, DrugConfigInput>>({
    norepinephrine: toInputConfig(configs.norepinephrine),
    dopamine: toInputConfig(configs.dopamine),
    dexmedetomidine: toInputConfig(configs.dexmedetomidine),
  });
  const [selectedDrug, setSelectedDrug] = useState<DrugType>('norepinephrine');
  const [snackbar, setSnackbar] = useState('');
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);

  // 編集ダイアログの表示状態
  const [editVisible, setEditVisible] = useState(false);

  // 入力値更新用ヘルパー
  const updateValue = (
    drug: DrugType,
    key: keyof DrugConfigInput,
    value: string | boolean,
  ) => {
    setLocalConfigs({
      ...localConfigs,
      [drug]: {
        ...localConfigs[drug],
        [key]: value,
      },
    });
  };

  const handleSave = async () => {
    const parsed: Record<DrugType, DrugConfig> = {
      norepinephrine: fromInputConfig(localConfigs.norepinephrine),
      dopamine: fromInputConfig(localConfigs.dopamine),
      dexmedetomidine: fromInputConfig(localConfigs.dexmedetomidine),
    };
    // 数値変換に失敗した場合はエラーメッセージを表示
    if (
      [
        parsed.norepinephrine.initialDose,
        parsed.norepinephrine.soluteAmount,
        parsed.norepinephrine.solutionVolume,
        parsed.dopamine.initialDose,
        parsed.dopamine.soluteAmount,
        parsed.dopamine.solutionVolume,
        parsed.dexmedetomidine.initialDose,
        parsed.dexmedetomidine.soluteAmount,
        parsed.dexmedetomidine.solutionVolume,
      ].some((v) => Number.isNaN(v))
    ) {
      setSnackbar('数値を正しく入力してください');
      return;
    }
    try {
      await setConfigs(parsed);
      setSnackbar('保存しました');
      onClose();
    } catch {
      setSnackbar('保存に失敗しました');
    }
  };

  const handleReset = async () => {
    await resetDrugToDefault(selectedDrug);
    setLocalConfigs({
      ...localConfigs,
      [selectedDrug]: toInputConfig(DRUGS[selectedDrug]),
    });
    setSnackbar('デフォルトに戻しました');
  };

  return (
    <Surface style={styles.container}>
      <DraggableFlatList
        data={drugOrder}
        keyExtractor={(item) => item}
        onDragEnd={({ data }) => setDrugOrder(data)}
        renderItem={({ item, drag }) => (
          <List.Item
            title={localConfigs[item].label}
            onPress={() => {
              setSelectedDrug(item);
              setEditVisible(true);
            }}
            onLongPress={drag}
            right={() => <IconButton icon="drag" />}
          />
        )}
        style={styles.list}
        contentContainerStyle={styles.scrollContainer}
      />
      <View style={styles.buttonRow}>
        <Button mode="contained" onPress={handleSave} style={styles.button}>
          保存
        </Button>
        <Button onPress={onClose} style={styles.button}>
          閉じる
        </Button>
      </View>
      <Portal>
        <Modal
          visible={editVisible}
          onDismiss={() => setEditVisible(false)}
          contentContainerStyle={styles.modal}
        >
          {(() => {
            const key = selectedDrug;
            const cfg = localConfigs[key];
            return (
              <View key={key} style={styles.section}>
                <Text style={styles.heading}>{cfg.label}</Text>
                <View style={styles.row}>
                  <Text style={styles.inlineText}>表示</Text>
                  <Switch
                    value={cfg.enabled}
                    onValueChange={(v) => updateValue(key, 'enabled', v)}
                  />
                </View>
                <TextInput
                  mode="outlined"
                  label={`初期投与量(${cfg.doseUnit})`}
                  style={styles.input}
                  keyboardType="numeric"
                  value={cfg.initialDose}
                  onChangeText={(v) => updateValue(key, 'initialDose', v)}
                />
                <View style={styles.row}>
                  <TextInput
                    mode="outlined"
                    label="溶質量"
                    style={styles.smallInput}
                    keyboardType="numeric"
                    value={cfg.soluteAmount}
                    onChangeText={(v) => updateValue(key, 'soluteAmount', v)}
                  />
                  <Menu
                    visible={unitMenuVisible}
                    onDismiss={() => setUnitMenuVisible(false)}
                    anchor={<Button onPress={() => setUnitMenuVisible(true)}>{cfg.soluteUnit}</Button>}
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
                    value={cfg.solutionVolume}
                    onChangeText={(v) => updateValue(key, 'solutionVolume', v)}
                  />
                </View>
                <View style={styles.buttonRow}>
                  <Button mode="outlined" onPress={handleReset} style={styles.button}>
                    デフォルトに戻す
                  </Button>
                  <Button mode="contained" onPress={() => setEditVisible(false)} style={styles.button}>
                    閉じる
                  </Button>
                </View>
              </View>
            );
          })()}
        </Modal>
      </Portal>
      <Snackbar visible={snackbar.length > 0} onDismiss={() => setSnackbar('')}>
        {snackbar}
      </Snackbar>
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
  list: { marginBottom: 16 },
  closeButton: { marginTop: 16 },
  modal: { backgroundColor: 'white', margin: 16, padding: 16 },
});
