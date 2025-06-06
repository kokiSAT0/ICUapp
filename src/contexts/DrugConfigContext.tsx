import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DRUGS, DrugConfig, DrugType } from '../config/drugs';

// 設定データを保存するキー名
const STORAGE_KEY = 'drugConfigs';

export type DrugConfigContextType = {
  configs: Record<DrugType, DrugConfig>;
  setConfigs: (configs: Record<DrugType, DrugConfig>) => void;
  resetToDefault: () => Promise<void>;
  loadConfigs: () => Promise<void>;
};

// デフォルト値としては設定ファイルの内容をそのまま用いる
const DrugConfigContext = createContext<DrugConfigContextType | undefined>(undefined);

export function DrugConfigProvider({ children }: { children: React.ReactNode }) {
  const [configs, setConfigsState] = useState<Record<DrugType, DrugConfig>>(DRUGS);

  // 保存された設定を読み込む
  const loadConfigs = async (): Promise<void> => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        setConfigsState(parsed);
      }
    } catch {
      // 読み込みに失敗した場合はデフォルトを使用
      setConfigsState(DRUGS);
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

  // デフォルトに戻す処理
  const resetToDefault = async (): Promise<void> => {
    await setConfigs(DRUGS);
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  return (
    <DrugConfigContext.Provider value={{ configs, setConfigs, resetToDefault, loadConfigs }}>
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
