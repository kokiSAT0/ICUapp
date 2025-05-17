import React from 'react';
import { View } from 'react-native';
import SOFACalculator from '../components/SOFACalculator';

export default function SOFAScreen() {
  return (
    <View style={{ padding: 20 }}>
      <SOFACalculator />
    </View>
  );
}
