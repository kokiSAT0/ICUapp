import React from 'react';
// Text は React Native Paper 版を利用する
import { Text } from 'react-native-paper';
import { StyleSheet } from 'react-native';

/**
 * 7-セグ風のデジタル数字を「固定桁数」で表示するコンポーネント
 *
 * - intDigits : 整数部に確保する桁数（例：2 → 十の位 + 一の位）
 * - fracDigits: 少数部に確保する桁数（例：2 → 0.1 + 0.01）
 * - 未使用桁には “8” を淡いグレー (#bbb) で表示
 * - 少数部はフォントサイズを 60% に縮小
 */
// このコンポーネントで受け取るプロパティの型を定義
export type DigitalNumberProps = {
  value: number;
  intDigits: number;
  fracDigits?: number;
  fontSize?: number;
};

export default function DigitalNumber({
  value,
  intDigits,
  fracDigits = 0,
  fontSize = 72,
}: DigitalNumberProps) {

  // 例: intDigits=2, fracDigits=2 なら "12.34"
  const formatted = value.toFixed(fracDigits);
  const [rawInt, rawFrac = ''] = formatted.split('.');

  // 左側に 0 を詰めて固定桁化
  const paddedInt = rawInt.padStart(intDigits, '0').slice(-intDigits);

  // ===== 整数部 =====
  const intElems: React.ReactNode[] = [];
  let activeFound = false; // 最初に 0 以外が現れたら true
  for (let i = 0; i < intDigits; i++) {
    const digit = paddedInt[i];
    const isLast = i === intDigits - 1;
    const isActive = activeFound || digit !== '0' || isLast; // 最後の桁は必ずアクティブ
    activeFound ||= digit !== '0';

    intElems.push(
      <Text
        key={`int-${i}`}
        style={[
          styles.digit,
          { fontSize },
          isActive ? styles.active : styles.placeholder,
        ]}
      >
        {isActive ? digit : '8'}
      </Text>,
    );
  }

  // ===== 少数部 =====
  const fracElems: React.ReactNode[] = [];
  if (fracDigits) {
    // 小数点
    fracElems.push(
      <Text key="dot" style={[styles.digit, styles.active, { fontSize }]}>
        .
      </Text>,
    );
    // 各桁
    for (let i = 0; i < fracDigits; i++) {
      const digit = rawFrac[i] ?? '0';
      fracElems.push(
        <Text
          key={`frac-${i}`}
          style={[
            styles.digit,
            styles.active,
            { fontSize: fontSize * 0.8 },
          ]}
        >
          {digit}
        </Text>,
      );
    }
  }

  return <Text style={styles.row}>{[...intElems, ...fracElems]}</Text>;
}

export const DIGIT_SPACING = 7;  // ← 追加：外部で再利用するため定数化

const styles = StyleSheet.create({
  // 数字全体を横並びに表示
  row: {
    flexDirection: 'row',
  },
  digit: {
    fontFamily: 'DSEG7Classic',
    letterSpacing: DIGIT_SPACING,
  },
  active: {
    color: '#222',
  },
  placeholder: {
    color: '#bbb',
  },
});
