import React, { forwardRef } from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Slider, { SliderProps } from '@react-native-community/slider';
import { useTheme } from 'react-native-paper';

// Slider コンポーネントを Paper のテーマに合わせてラップしたもの
export type PaperSliderProps = SliderProps & {
  style?: StyleProp<ViewStyle>;
};

// forwardRef を使うことで親コンポーネントからスライダーの値を
// 強制的に更新できるようにしておく
export default forwardRef(function PaperSlider(
  {
    style,
    minimumTrackTintColor,
    maximumTrackTintColor,
    thumbTintColor,
    ...rest
  }: PaperSliderProps,
  ref: React.Ref<Slider>
) {
  const { colors } = useTheme();

  return (
    <Slider
      ref={ref}
      {...rest}
      style={[styles.slider, style]}
      minimumTrackTintColor={minimumTrackTintColor ?? colors.primary}
      maximumTrackTintColor={maximumTrackTintColor ?? colors.outline}
      thumbTintColor={thumbTintColor ?? colors.primary}
    />
  );
});

const styles = StyleSheet.create({
  // デフォルトではスタイルを空にしておき、呼び出し側で拡張できるようにする
  slider: {},
});
