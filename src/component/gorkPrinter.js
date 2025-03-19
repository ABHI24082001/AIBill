// BluetoothPrinter.js
import React, {useState, useEffect, useCallback} from 'react';
import {Alert, Platform} from 'react-native';
import {
  BluetoothManager,
  BluetoothEscposPrinter,
} from 'react-native-bluetooth-escpos-printer';
import {DeviceEventEmitter, NativeEventEmitter} from 'react-native';
import {PERMISSIONS, requestMultiple, RESULTS} from 'react-native-permissions';

const BluetoothPrinter = ({onConnectionChange}) => {
  const [pairedDevices, setPairedDevices] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [boundAddress, setBoundAddress] = useState('');
  const [printerName, setPrinterName] = useState('');

  useEffect(() => {
    const initializeBluetooth = async () => {
      const enabled = await BluetoothManager.isBluetoothEnabled();
      if (!enabled) {
        await BluetoothManager.enableBluetooth();
      }
      setupListeners();
      scanDevices();
    };
    initializeBluetooth();
  }, []);

  const setupListeners = () => {
    const emitter =
      Platform.OS === 'ios'
        ? new NativeEventEmitter(BluetoothManager)
        : DeviceEventEmitter;
    emitter.addListener(BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED, rsp => {
      setPairedDevices(rsp.devices || []);
    });
    emitter.addListener(BluetoothManager.EVENT_DEVICE_FOUND, rsp => {
      setPairedDevices(prev => [...prev, rsp]);
    });
    emitter.addListener(BluetoothManager.EVENT_CONNECTION_LOST, () => {
      setIsConnected(false);
      setBoundAddress('');
      setPrinterName('');
      onConnectionChange(false);
    });
  };

  const scanDevices = useCallback(async () => {
    if (Platform.OS === 'android') {
      const permissions = await requestMultiple([
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ]);
      if (
        permissions[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] !==
        RESULTS.GRANTED
      ) {
        Alert.alert(
          'Permission Denied',
          'Location permission is required for Bluetooth scanning.',
        );
        return;
      }
    }
    await BluetoothManager.scanDevices();
  }, []);

  const connectPrinter = useCallback(async () => {
    if (pairedDevices.length === 0) {
      Alert.alert('No Devices', 'Please scan for Bluetooth devices first.');
      await scanDevices();
      return;
    }
    const device = pairedDevices[0]; // Connect to the first paired device
    try {
      await BluetoothManager.connect(device.address);
      setBoundAddress(device.address);
      setPrinterName(device.name);
      setIsConnected(true);
      onConnectionChange(true);
      Alert.alert('Success', `Connected to ${device.name}`);
    } catch (error) {
      Alert.alert('Connection Error', error.message);
    }
  }, [pairedDevices, scanDevices, onConnectionChange]);

  const printBill = useCallback(
    async (items, totalQuantity, totalPrice) => {
      if (!isConnected) {
        Alert.alert('Error', 'Please connect to a printer first.');
        return;
      }

      try {
        await BluetoothEscposPrinter.printerInit();
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.CENTER,
        );
        await BluetoothEscposPrinter.printText('=== Cafe Bill ===\n\n', {
          widthtimes: 1,
        });
        await BluetoothEscposPrinter.printText('123 Coffee St, City\n', {});
        await BluetoothEscposPrinter.printText(
          '------------------------------\n',
          {},
        );

        await BluetoothEscposPrinter.printText('Items\n', {widthtimes: 1});
        await BluetoothEscposPrinter.printText(
          '------------------------------\n',
          {},
        );
        const columnWidths = [8, 20, 12];
        for (const item of items) {
          await BluetoothEscposPrinter.printColumn(
            columnWidths,
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            [
              `${item.quantity}x`,
              item.name.substring(0, 20),
              `Rs ${item.amount * item.quantity}`,
            ],
            {},
          );
        }
        await BluetoothEscposPrinter.printText(
          '------------------------------\n',
          {},
        );
        await BluetoothEscposPrinter.printColumn(
          [24, 24],
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.RIGHT,
          ],
          ['Total Items', `${totalQuantity}`],
          {},
        );
        await BluetoothEscposPrinter.printColumn(
          [24, 24],
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.RIGHT,
          ],
          ['Total', `Rs ${totalPrice.toFixed(2)}`],
          {},
        );
        await BluetoothEscposPrinter.printText(
          '------------------------------\n',
          {},
        );
        await BluetoothEscposPrinter.printText('Thank you!\n\n\n', {});
        await BluetoothEscposPrinter.cutPaper();
      } catch (error) {
        Alert.alert('Print Error', error.message);
      }
    },
    [isConnected],
  );

  return {connectPrinter, printBill, isConnected, printerName};
};

export default BluetoothPrinter;
