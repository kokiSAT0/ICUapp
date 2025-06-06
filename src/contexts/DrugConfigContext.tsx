import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DRUGS,
  DrugConfig,
  DrugType,
  DRUG_ORDER_DEFAULT,
} from '../config/drugs';

// 設定データを保存するキー名
const STORAGE_KEY = 'drugConfigs';
// 起動時に表示する薬剤を保存するキー名
const INITIAL_DRUG_KEY = 'initialDrug';
// 薬剤並び順を保存するキー名
const ORDER_KEY = 'drugOrder';

export type DrugConfigContextType = {
  configs: Record<DrugType, DrugConfig>;
  setConfigs: (configs: Record<DrugType, DrugConfig>) => Promise<void>;
  initialDrug: DrugType;
  setInitialDrug: (drug: DrugType) => Promise<void>;
  drugOrder: DrugType[];
  setDrugOrder: (order: DrugType[]) => Promise<void>;
  resetToDefault: () => Promise<void>;
  // 指定した薬剤のみデフォルトに戻す
  resetDrugToDefault: (drug: DrugType) => Promise<void>;
  loadConfigs: () => Promise<void>;
};

// デフォルト値としては設定ファイルの内容をそのまま用いる
const DrugConfigContext = createContext<DrugConfigContextType | undefined>(undefined);

export function DrugConfigProvider({ children }: { children: React.ReactNode }) {
  const [configs, setConfigsState] = useState<Record<DrugType, DrugConfig>>(DRUGS);
  const [initialDrug, setInitialDrugState] = useState<DrugType>('norepinephrine');
  const [drugOrder, setDrugOrderState] = useState<DrugType[]>(DRUG_ORDER_DEFAULT);

  // 保存された設定を読み込む
  const loadConfigs = async (): Promise<void> => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        // 保存データが欠損していないか確認
        if (
          parsed.norepinephrine &&
          parsed.dopamine &&
          parsed.dexmedetomidine
        ) {
          setConfigsState(parsed);
        }
      }
      const orderJson = await AsyncStorage.getItem(ORDER_KEY);
      let order = DRUG_ORDER_DEFAULT;
      if (orderJson) {
        const parsedOrder = JSON.parse(orderJson);
        if (
          Array.isArray(parsedOrder) &&
          parsedOrder.every(
            (v) =>
              v === 'norepinephrine' || v === 'dopamine' || v === 'dexmedetomidine',
          )
        ) {
          order = parsedOrder as DrugType[];
        }
      }
      setDrugOrderState(order);
      await setInitialDrug(order[0]);
    } catch {
      // 読み込みに失敗した場合はデフォルトを使用
      setConfigsState(DRUGS);
      setDrugOrderState(DRUG_ORDER_DEFAULT);
      setInitialDrugState(DRUG_ORDER_DEFAULT[0]);
    }
  };

  // 設定変更時には保存も行う
  const setConfigs = async (newConfigs: Record<DrugType, DrugConfig>): Promise<void> => {
    setConfigsState(newConfigs);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newConfigs));
    } catch {
      // 保存に失敗してもアラートは出さない
    }
  };

  // 薬剤並び順を保存する
  const setDrugOrder = async (order: DrugType[]): Promise<void> => {
    setDrugOrderState(order);
    try {
      await AsyncStorage.setItem(ORDER_KEY, JSON.stringify(order));
    } catch {
      // 保存失敗時はエラーを無視
    }
  };

  // 起動時表示薬剤を保存する
  const setInitialDrug = async (drug: DrugType): Promise<void> => {
    setInitialDrugState(drug);
    try {
      await AsyncStorage.setItem(INITIAL_DRUG_KEY, drug);
    } catch {
      // 保存失敗時はエラーを無視
    }
  };

  // デフォルトに戻す処理
  const resetToDefault = async (): Promise<void> => {
    await setConfigs(DRUGS);
    await setInitialDrug('norepinephrine');
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
