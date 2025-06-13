import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

// 表示に使用する広告ユニットID を受け取る型を定義
export type AdBannerProps = {
  unitId: string;
};

export default function AdBanner({ unitId }: AdBannerProps) {
  return (
    <View style={styles.container}>
      {/* バナー広告を表示 */}
      <BannerAd unitId={unitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});

