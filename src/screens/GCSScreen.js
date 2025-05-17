import React from 'react';
import { View } from 'react-native';
import GCSCalculator from '../components/GCSCalculator';

export default function GCSScreen() {
  return (
    <View style={{ padding: 20 }}>
      <GCSCalculator />
    </View>
  );
}
