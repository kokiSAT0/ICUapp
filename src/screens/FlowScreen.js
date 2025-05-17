import React from 'react';
import { View } from 'react-native';
import FlowRateConverter from '../components/FlowRateConverter';

export default function FlowScreen() {
  return (
    <View style={{ padding: 20 }}>
      <FlowRateConverter />
    </View>
  );
}
