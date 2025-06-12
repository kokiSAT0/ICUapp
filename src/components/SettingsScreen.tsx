import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Surface,
  Text,
  TextInput,
  Button,
  Menu,
  Snackbar,
  Checkbox,
  IconButton,
  Portal,
  Modal,
  TouchableRipple,
  Appbar,
  Dialog,
} from 'react-native-paper';
// リストをドラッグ操作で並び替えるためのコンポーネント
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useDrugConfigs } from '../contexts/DrugConfigContext';
import { DrugType, DRUGS, DRUG_LIST, DrugConfig } from '../config/drugs';

// 数値項目のキー名
// 文字列で保持したい数値項目のキー一覧
// ここに追加すると自動的に変換処理が拡張される
type NumericKey =
  | 'initialDose'
  | 'soluteAmount'
  | 'solutionVolume'
  | 'doseMax'
  | 'dangerDose';
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
  // 最大投与量・危険閾値も文字列に変換して保持
  doseMax: String(cfg.doseMax),
  dangerDose: cfg.dangerDose !== undefined ? String(cfg.dangerDose) : '',
});

// DrugConfigInput から DrugConfig へ変換
const fromInputConfig = (cfg: DrugConfigInput): DrugConfig => ({
  ...cfg,
  initialDose: parseFloat(cfg.initialDose),
  soluteAmount: parseFloat(cfg.soluteAmount),
  solutionVolume: parseFloat(cfg.solutionVolume),
  doseMax: parseFloat(cfg.doseMax),
  // 空文字列の場合は undefined を返す
  dangerDose: cfg.dangerDose === '' ? undefined : parseFloat(cfg.dangerDose),
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
  // DrugList を走査して初期設定を作る
  // こうしておくと薬剤を追加しても自動で画面に反映される
  const createLocalConfigs = (): Record<DrugType, DrugConfigInput> =>
    DRUG_LIST.reduce((acc, key) => {
      acc[key] = toInputConfig(configs[key]);
      return acc;
    }, {} as Record<DrugType, DrugConfigInput>);

  const [localConfigs, setLocalConfigs] = useState<Record<DrugType, DrugConfigInput>>(
    createLocalConfigs(),
  );
  // 現在編集対象の薬剤。配列の先頭を初期値とする
  const [selectedDrug, setSelectedDrug] = useState<DrugType>(DRUG_LIST[0]);
  const [snackbar, setSnackbar] = useState('');
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);

  // 編集ダイアログの表示状態
  const [editVisible, setEditVisible] = useState(false);
  // ヘルプダイアログの表示状態
  const [helpVisible, setHelpVisible] = useState(false);

  // 画面を閉じる際に並び順を保存する
  const handleClose = async () => {
    // 表示中の薬剤と非表示薬剤に分ける
    const enabledDrugs: DrugType[] = [];
    const disabledDrugs: DrugType[] = [];
    drugOrder.forEach((d) => {
      if (localConfigs[d].enabled) enabledDrugs.push(d);
      else disabledDrugs.push(d);
    });
    // 表示薬剤→非表示薬剤の順に整理
    await setDrugOrder([...enabledDrugs, ...disabledDrugs]);
    onClose();
  };

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


  const handleReset = async () => {
    await resetDrugToDefault(selectedDrug);
    setLocalConfigs({
      ...localConfigs,
      [selectedDrug]: toInputConfig(DRUGS[selectedDrug]),
    });
    setSnackbar('デフォルトに戻しました');
  };

  // 薬剤を表示対象とするかどうかを切り替える
  // 非表示にした薬剤は並び順の末尾へ送る
  const toggleEnabled = async (drug: DrugType) => {
    // 新しい表示状態を計算
    const newEnabled = !localConfigs[drug].enabled;
    setLocalConfigs({
      ...localConfigs,
      [drug]: { ...localConfigs[drug], enabled: newEnabled },
    });

    // 並び順を更新。非表示薬剤は末尾に集める
    const orderWithoutDrug = drugOrder.filter((d) => d !== drug);
    if (newEnabled) {
      const firstDisabled = orderWithoutDrug.findIndex(
        (d) => !localConfigs[d].enabled,
      );
      const insertIndex = firstDisabled === -1 ? orderWithoutDrug.length : firstDisabled;
      orderWithoutDrug.splice(insertIndex, 0, drug);
    } else {
      orderWithoutDrug.push(drug);
    }
    await setDrugOrder(orderWithoutDrug);
  };

  return (
    // SafeAreaView で余白が二重にならないよう top を除外
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
    <Surface style={styles.container}>
      {/* ヘッダー。左に戻るボタン、右にヘルプボタンを配置 */}
      <Appbar.Header>
        <Appbar.BackAction onPress={handleClose} />
        <Appbar.Content title="設定" />
        <Appbar.Action icon="help-circle" onPress={() => setHelpVisible(true)} />
      </Appbar.Header>
      <DraggableFlatList
        data={drugOrder}
        keyExtractor={(item) => item}
        // ドラッグ操作の結果をそのまま保存する
        // 非表示薬剤を末尾へ移動する処理は toggleEnabled で行う
        onDragEnd={({ data }) => setDrugOrder(data)}
        renderItem={({ item, drag }) => {
          const textColor = localConfigs[item].enabled ? undefined : '#888';
          return (
            <View style={styles.itemRow}>
              <Checkbox
                status={localConfigs[item].enabled ? 'checked' : 'unchecked'}
                onPress={() => toggleEnabled(item)}
                color={textColor}
                uncheckedColor={textColor}
              />
              <TouchableRipple
              onPress={() => {
                setSelectedDrug(item);
                setEditVisible(true);
              }}
              style={styles.titleArea}
            >
              <Text
                style={[
                  styles.itemTitle,
                  { color: localConfigs[item].enabled ? undefined : '#888' },
                ]}
              >
                {localConfigs[item].label}
              </Text>
            </TouchableRipple>
            <IconButton icon="drag" onPressIn={drag} />
          </View>
        );
        }}
        style={styles.list}
        contentContainerStyle={styles.scrollContainer}
      />
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
                <TextInput
                  mode="outlined"
                  label={`初期投与量(${cfg.doseUnit})`}
                  style={styles.input}
                  keyboardType="numeric"
                  value={cfg.initialDose}
                  onChangeText={(v) => updateValue(key, 'initialDose', v)}
                />
                {/* 最大投与量を編集する入力欄 */}
                <TextInput
                  mode="outlined"
                  label={`最大投与量(${cfg.doseUnit})`}
                  style={styles.input}
                  keyboardType="numeric"
                  value={cfg.doseMax}
                  onChangeText={(v) => updateValue(key, 'doseMax', v)}
                />
                {/* 危険な投与量の目安。空欄にすると警告バーを非表示にできる */}
                <TextInput
                  mode="outlined"
                  label={`危険閾値(${cfg.doseUnit})`}
                  style={styles.input}
                  keyboardType="numeric"
                  value={cfg.dangerDose}
                  onChangeText={(v) => updateValue(key, 'dangerDose', v)}
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
        {/* ヘルプダイアログ */}
        <Portal>
          <Dialog visible={helpVisible} onDismiss={() => setHelpVisible(false)}>
            <Dialog.Title>使い方</Dialog.Title>
            <Dialog.Content>
              <Text>
                {`設定画面では以下の操作ができます。\n\n` +
                  "・薬剤名をタップして初期投与量や希釈条件を編集\n" +
                  "・チェックボックスで計算画面に表示する薬剤を選択\n" +
                  "・右端のハンドルをドラッグして表示順を変更\n" +
                  "・編集画面の\"デフォルトに戻す\"で設定をリセット\n" +
                  "・左上の戻るボタンで並び替えを保存して閉じる"}
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setHelpVisible(false)}>閉じる</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      <Snackbar visible={snackbar.length > 0} onDismiss={() => setSnackbar('')}>
        {snackbar}
      </Snackbar>
    </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // SafeAreaView 用のスタイル
  safeArea: { flex: 1 },
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
  // 薬剤一覧の1行分のスタイル
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  // 薬剤名表示部分のスタイル
  titleArea: { flex: 1, paddingVertical: 12 },
  // 薬剤名テキストのスタイル
  itemTitle: { fontSize: 16 },
});
