import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DRUGS, DRUG_LIST, DrugConfig, DrugType } from '@/config/drugs';

// 設定データを保存するキー名
const STORAGE_KEY = 'drugConfigs';
// 起動時に表示する薬剤を保存するキー名
const INITIAL_DRUG_KEY = 'initialDrug';
// 薬剤の並び順を保存するキー名
const STORAGE_KEY_ORDER = 'drugOrder';

export type DrugConfigContextType = {
  configs: Record<DrugType, DrugConfig>;
  setConfigs: (configs: Record<DrugType, DrugConfig>) => Promise<void>;
  initialDrug: DrugType;
  setInitialDrug: (drug: DrugType) => Promise<void>;
  resetToDefault: () => Promise<void>;
  // 指定した薬剤のみデフォルトに戻す
  resetDrugToDefault: (drug: DrugType) => Promise<void>;
  // 薬剤の並び順
  drugOrder: DrugType[];
  // 並び順を保存する
  setDrugOrder: (order: DrugType[]) => Promise<void>;
  loadConfigs: () => Promise<void>;
  // AsyncStorage 失敗時に表示するメッセージ
  snackbar: string;
  setSnackbar: (msg: string) => void;
};

// デフォルト値としては設定ファイルの内容をそのまま用いる
const DrugConfigContext = createContext<DrugConfigContextType | undefined>(undefined);

export function DrugConfigProvider({ children }: { children: React.ReactNode }) {
  const [configs, setConfigsState] = useState<Record<DrugType, DrugConfig>>(DRUGS);
  // 初期表示薬剤は DRUG_LIST の先頭を利用
  const [initialDrug, setInitialDrugState] = useState<DrugType>(DRUG_LIST[0]);
  // 薬剤の表示順。デフォルトは設定ファイルと同じ順序
  const [drugOrder, setDrugOrderState] = useState<DrugType[]>([...DRUG_LIST]);
  // エラーメッセージ表示用
  const [snackbar, setSnackbar] = useState('');

  // 保存された設定を読み込む
  const loadConfigs = async (): Promise<void> => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        // すべての薬剤設定が存在するか確認
        if (DRUG_LIST.every((key) => parsed[key])) {
          setConfigsState(parsed);
        }
      }

      const orderData = await AsyncStorage.getItem(STORAGE_KEY_ORDER);
      let loadedOrder: DrugType[] = [...DRUG_LIST];
      if (orderData) {
        const parsedOrder = JSON.parse(orderData);
        if (Array.isArray(parsedOrder) && parsedOrder.every((d: any) => DRUG_LIST.includes(d))) {
          loadedOrder = [...parsedOrder];
          // 新しく追加された薬剤があれば末尾に追加
          DRUG_LIST.forEach((id) => {
            if (!loadedOrder.includes(id)) loadedOrder.push(id);
          });
        }
      }
      setDrugOrderState(loadedOrder);
      // 並び順の先頭を初期薬剤として保存
      await setInitialDrug(loadedOrder[0]);
    } catch {
      // 読み込みに失敗した場合はデフォルトを使用
      setConfigsState(DRUGS);
      setInitialDrugState(DRUG_LIST[0]);
      setDrugOrderState([...DRUG_LIST]);
      setSnackbar('設定の読み込みに失敗しました');
    }
  };

  // 設定変更時には保存も行う
  const setConfigs = async (newConfigs: Record<DrugType, DrugConfig>): Promise<void> => {
    setConfigsState(newConfigs);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newConfigs));
    } catch {
      // 保存に失敗したらメッセージを表示
      setSnackbar('設定の保存に失敗しました');
    }
  };

  // 起動時表示薬剤を保存する
  const setInitialDrug = async (drug: DrugType): Promise<void> => {
    setInitialDrugState(drug);
    try {
      await AsyncStorage.setItem(INITIAL_DRUG_KEY, drug);
    } catch {
      // 保存失敗時はメッセージ表示
      setSnackbar('設定の保存に失敗しました');
    }
  };

  // 並び順を保存する処理
  const setDrugOrder = async (order: DrugType[]): Promise<void> => {
    setDrugOrderState(order);
    // 並び順が変わったら先頭を初期表示薬剤として保存する
    await setInitialDrug(order[0]);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(order));
    } catch {
      // 保存に失敗した場合は通知
      setSnackbar('設定の保存に失敗しました');
    }
  };

  // デフォルトに戻す処理
  const resetToDefault = async (): Promise<void> => {
    await setConfigs(DRUGS);
    await setInitialDrug(DRUG_LIST[0]);
    await setDrugOrder([...DRUG_LIST]);
  };

  // 特定の薬剤のみデフォルトに戻す処理
  const resetDrugToDefault = async (drug: DrugType): Promise<void> => {
    const updated = { ...configs, [drug]: DRUGS[drug] };
    await setConfigs(updated);
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  return (
    <DrugConfigContext.Provider
      value={{
        configs,
        setConfigs,
        initialDrug,
        setInitialDrug,
        drugOrder,
        setDrugOrder,
        resetToDefault,
        resetDrugToDefault,
        loadConfigs,
        snackbar,
        setSnackbar,
      }}
    >
      {children}
    </DrugConfigContext.Provider>
  );
}

export function useDrugConfigs(): DrugConfigContextType {
  const ctx = useContext(DrugConfigContext);
  if (!ctx) {
    throw new Error('useDrugConfigs must be used within DrugConfigProvider');
  }
  return ctx;
}
