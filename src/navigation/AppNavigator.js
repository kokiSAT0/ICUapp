import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import FlowScreen from '../screens/FlowScreen';

// ナビゲーションの設定
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'ホーム' }} />
        <Stack.Screen name="Flow" component={FlowScreen} options={{ title: '流量計算' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
