import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Slider, { SliderProps } from '@react-native-community/slider';
import { useTheme } from 'react-native-paper';

// Slider コンポーネントを Paper のテーマに合わせてラップしたもの
export type PaperSliderProps = SliderProps & {
  style?: StyleProp<ViewStyle>;
};

export default function PaperSlider({
  style,
  minimumTrackTintColor,
  maximumTrackTintColor,
  thumbTintColor,
  ...rest
}: PaperSliderProps) {
  const { colors } = useTheme();

  return (
    <Slider
      {...rest}
      style={[styles.slider, style]}
      minimumTrackTintColor={minimumTrackTintColor ?? colors.primary}
      maximumTrackTintColor={maximumTrackTintColor ?? colors.outline}
      thumbTintColor={thumbTintColor ?? colors.primary}
    />
  );
}

const styles = StyleSheet.create({
  // デフォルトではスタイルを空にしておき、呼び出し側で拡張できるようにする
  slider: {},
});
