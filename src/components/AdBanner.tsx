import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

// 表示に使用する広告ユニットID を受け取る型を定義
export type AdBannerProps = {
  unitId: string;
  /**
   * バナーの高さが決まったときに通知するコールバック
   * height は表示されたバナーの実際の高さ
   */
  onHeightChange?: (height: number) => void;
};

export default function AdBanner({ unitId, onHeightChange }: AdBannerProps) {
  // 広告読み込み時とサイズ変更時の処理
  const handleSize = (dim: { width: number; height: number }) => {
    // 高さが得られたら親に通知する
    onHeightChange?.(dim.height);
  };
  return (
    <View style={styles.container}>
      {/* バナー広告を表示 */}
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={handleSize}
        onSizeChange={handleSize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});

