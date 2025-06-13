import React from 'react';
import { Snackbar } from 'react-native-paper';
import { useDrugConfigs } from '@/contexts/DrugConfigContext';

export type DrugConfigSnackbarProps = {};

// グローバルなエラーメッセージ表示用コンポーネント
export default function DrugConfigSnackbar(_: DrugConfigSnackbarProps) {
  const { snackbar, setSnackbar } = useDrugConfigs();
  return (
    <Snackbar visible={snackbar.length > 0} onDismiss={() => setSnackbar('')}>
      {snackbar}
    </Snackbar>
  );
}
