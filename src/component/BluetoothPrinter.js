import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, ActivityIndicator} from 'react-native';
import {
  BluetoothEscposPrinter,
  BluetoothManager,
} from 'react-native-bluetooth-escpos-printer';

const BluetoothPrinter = ({onPrint}) => {
  const [pairedDevices, setPairedDevices] = useState([]);
  const scanDevices = async () => {
    setLoading(true);
    try {
      const devices = await BluetoothManager.list();
      setPairedDevices(devices);
    } catch (error) {
      console.error('Error scanning devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectToDevice = async device => {
    setLoading(true);
    try {
      await BluetoothManager.connect(device.address);
      setConnected(true);
      setSelectedDevice(device);
    } catch (error) {
      console.error('Error connecting to device:', error);
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = async (items, totalPrice) => {
    if (!connected) {
      alert('Please connect to a printer first.');
      return;
    }

    try {
      await BluetoothEscposPrinter.printerAlign(
        BluetoothEscposPrinter.ALIGN.CENTER,
      );
      await BluetoothEscposPrinter.printText('Order Receipt\n\n', {});

      for (const item of items) {
        await BluetoothEscposPrinter.printText(
          `${item.name} x ${item.quantity} - Rs ${item.amount.toFixed(2)}\n`,
          {},
        );
      }

      await BluetoothEscposPrinter.printText(
        `\nTotal: Rs ${totalPrice.toFixed(2)}\n\n`,
        {},
      );
      await BluetoothEscposPrinter.printText('Thank you for your order!\n', {});
    } catch (error) {
      console.error('Error printing receipt:', error);
    }
  };

  // Call the printReceipt function when onPrint is triggered
  useEffect(() => {
    if (onPrint) {
      onPrint(printReceipt);
    }
  }, [onPrint]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth Printer</Text>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {pairedDevices.map((device, index) => (
        <Button
          key={index}
          title={`Connect to ${device.name}`}
          onPress={() => connectToDevice(device)}
          disabled={connected}
        />
      ))}
      {connected && (
        <Text style={styles.connectedText}>
          Connected to {selectedDevice.name}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  connectedText: {
    color: 'green',
    marginVertical: 10,
  },
});

export default BluetoothPrinter;
