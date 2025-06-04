import React from 'react';
import { View, StyleSheet } from 'react-native';
import FlowRateConverter from '../components/FlowRateConverter';

export type FlowScreenProps = {};

export default function FlowScreen(_: FlowScreenProps) {
  return (
    <View style={styles.container}>
      <FlowRateConverter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});
