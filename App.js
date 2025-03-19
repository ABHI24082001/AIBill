import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
const App = () => (
  <SafeAreaProvider>
    <GestureHandlerRootView>
      <AppNavigator />
    </GestureHandlerRootView>
  </SafeAreaProvider>
);

export default App;
