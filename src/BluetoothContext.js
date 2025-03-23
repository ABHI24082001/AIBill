// BluetoothContext.js
import React, {createContext, useState, useCallback} from 'react';
import {BluetoothManager} from 'react-native-bluetooth-escpos-printer';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BluetoothContext = createContext();

export const BluetoothProvider = ({children}) => {
  const [boundAddress, setBoundAddress] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Connect to a Bluetooth device
  const connect = useCallback(async (address, deviceName) => {
    setLoading(true);
    try {
      await BluetoothManager.connect(address);
      setBoundAddress(address);
      setName(deviceName || 'UNKNOWN');

      // Save the connected device to AsyncStorage
      await AsyncStorage.setItem(
        'lastPrinter',
        JSON.stringify({address, name: deviceName}),
      );
      console.log('Connected to printer:', deviceName);
    } catch (error) {
      console.error('Connection failed:', error);
      throw error; // Re-throw the error for handling in the component
    } finally {
      setLoading(false);
    }
  }, []);

  // Unpair a Bluetooth device
  const unPair = useCallback(async address => {
    setLoading(true);
    try {
      await BluetoothManager.unpaire(address);
      setBoundAddress('');
      setName('');

      // Remove the saved printer from AsyncStorage
      await AsyncStorage.removeItem('lastPrinter');
      console.log('Printer unpaired');
    } catch (error) {
      console.error('Unpair failed:', error);
      throw error; // Re-throw the error for handling in the component
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore the last connected printer
  const restoreLastConnection = useCallback(async () => {
    try {
      const lastPrinter = await AsyncStorage.getItem('lastPrinter');
      if (lastPrinter) {
        const printer = JSON.parse(lastPrinter);
        await connect(printer.address, printer.name);
      }
    } catch (error) {
      console.error('Failed to restore printer:', error);
    }
  }, [connect]);

  return (
    <BluetoothContext.Provider
      value={{
        boundAddress,
        name,
        connect,
        unPair,
        loading,
        restoreLastConnection,
      }}>
      {children}
    </BluetoothContext.Provider>
  );
};
