import React, { useState, useEffect } from 'react';
// Alert はエラーをポップアップ表示するための仕組み
import { StyleSheet, Alert } from 'react-native';
import { Portal, Dialog, TextInput, Button } from 'react-native-paper';

// 値編集モーダルのプロパティ型
export type CompositionDialogProps = {
  visible: boolean; // モーダル表示状態
  onDismiss: () => void; // 閉じるときの処理
  doseMg: number; // 溶質量
  volumeMl: number; // 溶液量
  weightKg: number; // 体重
  onSubmit: (dose: number, volume: number, weight: number) => void; // 保存時の処理
};

// Dialog コンポーネントを使って値を入力
export default function CompositionDialog({
  visible,
  onDismiss,
  doseMg,
  volumeMl,
  weightKg,
  onSubmit,
}: CompositionDialogProps) {
  // TextInput で扱いやすいように文字列でステート管理
  const [dose, setDose] = useState(String(doseMg));
  const [volume, setVolume] = useState(String(volumeMl));
  const [weight, setWeight] = useState(String(weightKg));

  // モーダルを開くたびに最新値を反映
  useEffect(() => {
    if (visible) {
      setDose(String(doseMg));
      setVolume(String(volumeMl));
      setWeight(String(weightKg));
    }
  }, [visible, doseMg, volumeMl, weightKg]);

  // OK ボタンを押したときの処理
  const handleSubmit = () => {
    // TextInput の内容を数値へ変換。parseFloat は失敗すると NaN を返す
    const doseVal = parseFloat(dose);
    const volumeVal = parseFloat(volume);
    const weightVal = parseFloat(weight);

    /*
     * 入力チェック
     * - 数値に変換できるか？
     * - 組成(溶質量・溶液量)は 0 より大きいか？
     * - 体重は 1～200 の範囲か？
     */
    if (
      Number.isNaN(doseVal) ||
      Number.isNaN(volumeVal) ||
      Number.isNaN(weightVal)
    ) {
      // 数値以外が入力された場合はエラーを表示
      Alert.alert('入力エラー', '値は必ず数値で入力してください');
      return;
    }
    if (doseVal <= 0 || volumeVal <= 0 || weightVal < 1 || weightVal > 200) {
      // Alert でエラーメッセージを表示して処理を中断
      Alert.alert('入力エラー', '体重は1～200kg、組成は正の数で入力してください。');
      return;
    }

    try {
      onSubmit(doseVal, volumeVal, weightVal);
    } catch (err) {
      // エラー内容をユーザーへ知らせる
      Alert.alert('保存エラー', '値の保存中に問題が発生しました');
    }
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>値の編集</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="溶質量(mg)"
            keyboardType="numeric"
            value={dose}
            onChangeText={setDose}
            style={styles.input}
          />
          <TextInput
            label="溶液量(ml)"
            keyboardType="numeric"
            value={volume}
            onChangeText={setVolume}
            style={styles.input}
          />
          <TextInput
            label="体重(kg)"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            style={[styles.input, styles.weightInput]}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>キャンセル</Button>
          <Button onPress={handleSubmit}>保存</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  input: { marginBottom: 8 },
  // 体重入力だけ下に余白を広げる
  weightInput: {
    marginTop: 16,
  },
});
