import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import FlowScreen from '../screens/FlowScreen';
import GCSScreen from '../screens/GCSScreen';
import RASSScreen from '../screens/RASSScreen';
import SOFAScreen from '../screens/SOFAScreen';
import APACHEScreen from '../screens/APACHEScreen';

// ナビゲーションの設定
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'ホーム' }} />
        <Stack.Screen name="Flow" component={FlowScreen} options={{ title: '流量計算' }} />
        <Stack.Screen name="GCS" component={GCSScreen} options={{ title: 'GCS 計算' }} />
        <Stack.Screen name="RASS" component={RASSScreen} options={{ title: 'RASS 計算' }} />
        <Stack.Screen name="SOFA" component={SOFAScreen} options={{ title: 'SOFA 計算' }} />
        <Stack.Screen name="APACHE" component={APACHEScreen} options={{ title: 'APACHE 計算' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
