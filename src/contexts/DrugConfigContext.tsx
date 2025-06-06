import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DRUGS, DrugConfig, DrugType } from '../config/drugs';

// 設定データを保存するキー名
const STORAGE_KEY = 'drugConfigs';
// 起動時に表示する薬剤を保存するキー名
const INITIAL_DRUG_KEY = 'initialDrug';

export type DrugConfigContextType = {
  configs: Record<DrugType, DrugConfig>;
  setConfigs: (configs: Record<DrugType, DrugConfig>) => Promise<void>;
  initialDrug: DrugType;
  setInitialDrug: (drug: DrugType) => Promise<void>;
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

  // 保存された設定を読み込む
  const loadConfigs = async (): Promise<void> => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        setConfigsState(parsed);
      }
      const d = await AsyncStorage.getItem(INITIAL_DRUG_KEY);
      if (d) {
        setInitialDrugState(d as DrugType);
      }
    } catch {
      // 読み込みに失敗した場合はデフォルトを使用
      setConfigsState(DRUGS);
      setInitialDrugState('norepinephrine');
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
