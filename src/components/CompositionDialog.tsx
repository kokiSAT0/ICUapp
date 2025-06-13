import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
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
    // parseFloat で数値に変換。失敗したら 0
    onSubmit(parseFloat(dose) || 0, parseFloat(volume) || 0, parseFloat(weight) || 0);
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
