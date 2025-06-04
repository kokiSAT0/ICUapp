import React, { useState, forwardRef } from 'react';
import { StyleSheet, StyleProp, ViewStyle, View, LayoutChangeEvent } from 'react-native';
import Slider, { SliderProps } from '@react-native-community/slider';
import { useTheme } from 'react-native-paper';

// Slider コンポーネントを Paper のテーマに合わせてラップしたもの
export type PaperSliderProps = SliderProps & {
  style?: StyleProp<ViewStyle>;
  // この値を超える範囲に警告色を表示する
  dangerThreshold?: number;
};


// forwardRef を使うことで親コンポーネントからスライダーの値を
// 強制的に更新できるようにしておく
export default forwardRef(function PaperSlider(
  {
    style,
    minimumTrackTintColor,
    maximumTrackTintColor,
    thumbTintColor,
    dangerThreshold,
    ...rest
  }: PaperSliderProps,
  ref: React.Ref<Slider>
) {

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
    <View style={styles.container} onLayout={handleLayout}>
      <Slider
        ref={ref}
        {...rest}
        style={[styles.slider, style]}
        minimumTrackTintColor={minimumTrackTintColor ?? colors.primary}
        maximumTrackTintColor={maximumTrackTintColor ?? colors.outline}
        thumbTintColor={thumbTintColor ?? colors.primary}
      />
      {dangerThreshold !== undefined && (
        <View
          pointerEvents="none"
          style={[
            styles.danger,
            {
              left: startX,
              width: width - startX,
              backgroundColor: colors.error,
            },
          ]}
        />
      )}
    </View>
  );
});

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
