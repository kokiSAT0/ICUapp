import React, { useState } from 'react';
import { StyleSheet, StyleProp, ViewStyle, View, LayoutChangeEvent } from 'react-native';
import Slider, { SliderProps } from '@react-native-community/slider';
import { useTheme } from 'react-native-paper';

// Slider コンポーネントを Paper のテーマに合わせてラップしたもの
export type PaperSliderProps = SliderProps & {
  style?: StyleProp<ViewStyle>;
  // この値を超える範囲に警告色を表示する
  dangerThreshold?: number;
};

export default function PaperSlider({
  style,
  minimumTrackTintColor,
  maximumTrackTintColor,
  thumbTintColor,
  dangerThreshold,
  ...rest
}: PaperSliderProps) {
  const { colors } = useTheme();
  // onLayout で取得した幅を保持
  const [width, setWidth] = useState(0);

  const handleLayout = (e: LayoutChangeEvent): void => {
    setWidth(e.nativeEvent.layout.width);
  };

  const min = rest.minimumValue ?? 0;
  const max = rest.maximumValue ?? 1;
  const startX =
    dangerThreshold !== undefined && max > min
      ? ((dangerThreshold - min) / (max - min)) * width
      : 0;

  return (
    <View onLayout={handleLayout} style={[styles.container, style]}>
      {dangerThreshold !== undefined && width > 0 && startX < width && (
        <View
          pointerEvents="none"
          style={[styles.danger, { backgroundColor: colors.error, left: startX, width: width - startX }]}
        />
      )}
      <Slider
        {...rest}
        style={styles.slider}
        minimumTrackTintColor={minimumTrackTintColor ?? colors.primary}
        maximumTrackTintColor={maximumTrackTintColor ?? colors.outline}
        thumbTintColor={thumbTintColor ?? colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  // danger 表示用バー
  danger: {
    position: 'absolute',
    top: '50%',
    height: 4,
    marginTop: -2,
  },
  // デフォルトではスタイルを空にしておき、呼び出し側で拡張できるようにする
  slider: {},
});
