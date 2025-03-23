// App.js
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {BluetoothProvider} from './src/BluetoothContext'; // Import the BluetoothProvider
import AppNavigator from './src/navigation/AppNavigator';

const App = () => (
  <SafeAreaProvider>
    <GestureHandlerRootView style={{flex: 1}}>
      <BluetoothProvider>
        <AppNavigator />
      </BluetoothProvider>
    </GestureHandlerRootView>
  </SafeAreaProvider>
);

export default App;
