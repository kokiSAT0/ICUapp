import React, { useRef } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';

// 円形ダイアルコンポーネント
// 触った位置から角度を算出し、値を計算して親へ通知する
export default function CircularDial({
  value,
  onChange,
  min,
  max,
  step,
  unit,
  digits
}) {
  // ダイアルの大きさと半径
  const size = 120;
  const radius = size / 2;

  // 現在値からポインタ角度(0-360度)を求める
  const angle = ((value - min) / (max - min)) * 360;

  // タッチ操作を処理する PanResponder を作成
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // ドラッグ中のイベント
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        // 中心からの距離を計算
        const dx = locationX - radius;
        const dy = locationY - radius;
        // dx,dy から角度を求め、上方向を0度として時計回りに変換
        let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (deg < 0) deg += 360;
        // 角度から値へ変換し、刻み幅で丸めて範囲に収める
        const raw = min + (deg / 360) * (max - min);
        const rounded = Math.round(raw / step) * step;
        const clipped = Math.max(min, Math.min(max, rounded));
        onChange(clipped);
      }
    })
  ).current;

  return (
    <View style={styles.wrapper}>
      {/* View 全体でタッチを受け取る */}
      <View
        style={[styles.dial, { width: size, height: size }]}
        {...panResponder.panHandlers}
      >
        {/* 針を回転させて表示 */}
        <View
          style={[
            styles.pointer,
            {
              height: size * 0.45,
              top: size * 0.05,
              transform: [{ rotate: `${angle}deg` }]
            }
          ]}
        />
        {/* 中央に現在値と単位を表示 */}
        <Text style={styles.valueText}>
          {value.toFixed(digits)} {unit}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12
  },
  dial: {
    borderWidth: 2,
    borderColor: '#555',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pointer: {
    position: 'absolute',
    width: 2,
    backgroundColor: '#f00'
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold'
  }
});
