import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {BluetoothEscposPrinter} from 'react-native-bluetooth-escpos-printer';
import {hsdLogo} from './dummylogo';

const SamplePrint = () => {
  return (
    <View>
      <Text>Sample Print Instructions</Text>
      {/* <View style={styles.btn}>
        <Button
          onPress={async () => {
            await BluetoothEscposPrinter.printBarCode(
              '123456789012',
              BluetoothEscposPrinter.BARCODETYPE.JAN13,
              3,
              120,
              0,
              2,
            );
            await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
          }}
          title="Print BarCode"
        />
      </View>
      <View style={styles.btn}>
        <Button
          onPress={async () => {
            await BluetoothEscposPrinter.printQRCode(
              'https://hsd.co.id',
              280,
              BluetoothEscposPrinter.ERROR_CORRECTION.L,
            );
            await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
          }}
          title="Print QR Code"
        />
      </View>

      <View style={styles.btn}>
        <Button
          onPress={async () => {
            await BluetoothEscposPrinter.printerUnderLine(2);
            await BluetoothEscposPrinter.printText('John Doe\r\n', {
              encoding: 'GBK',
              codepage: 0,
              widthtimes: 0,
              heigthtimes: 0,
              fonttype: 1,
            });
            await BluetoothEscposPrinter.printerUnderLine(0);
            await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
          }}
          title="Print Underlined Text"
        />
      </View> */}

      <View style={styles.btn}>
        <Button
          title="Print Shopping Receipt"
          onPress={async () => {
            let columnWidths = [8, 20, 20];
            try {
              await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
              await BluetoothEscposPrinter.printPic(hsdLogo, {
                width: 250,
                left: 150,
              });
              await BluetoothEscposPrinter.printerAlign(
                BluetoothEscposPrinter.ALIGN.CENTER,
              );
              await BluetoothEscposPrinter.printColumn(
                [48],
                [BluetoothEscposPrinter.ALIGN.CENTER],
                ['123 Main Street, City, Country'],
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [32],
                [BluetoothEscposPrinter.ALIGN.CENTER],
                ['https://shopwebsite.com'],
                {},
              );
              await BluetoothEscposPrinter.printText(
                '================================================',
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [24, 24],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['Customer', 'John Doe'],
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [24, 24],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['Packaging', 'Yes'],
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [24, 24],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['Delivery', 'Pickup'],
                {},
              );
              await BluetoothEscposPrinter.printText(
                '================================================',
                {},
              );
              await BluetoothEscposPrinter.printText('Products\r\n', {
                widthtimes: 1,
              });
              await BluetoothEscposPrinter.printText(
                '================================================',
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                columnWidths,
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['1x', 'Squid', '$20.00'],
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                columnWidths,
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['1x', 'Dried Fish', '$30.00'],
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                columnWidths,
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['1x', 'Tuna', '$40.00'],
                {},
              );
              await BluetoothEscposPrinter.printText(
                '================================================',
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [24, 24],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['Subtotal', '$90.00'],
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [24, 24],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['Packaging', '$6.00'],
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [24, 24],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['Delivery', '$0.00'],
                {},
              );
              await BluetoothEscposPrinter.printText(
                '================================================',
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [24, 24],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['Total', '$96.00'],
                {},
              );
              await BluetoothEscposPrinter.printText('\r\n\r\n', {});
              await BluetoothEscposPrinter.printerAlign(
                BluetoothEscposPrinter.ALIGN.CENTER,
              );
              await BluetoothEscposPrinter.printQRCode(
                'ORDER123456',
                280,
                BluetoothEscposPrinter.ERROR_CORRECTION.L,
              );
              await BluetoothEscposPrinter.printText(
                '================================================',
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [48],
                [BluetoothEscposPrinter.ALIGN.CENTER],
                ['Saturday, June 18, 2022 - 06:00 AM'],
                {},
              );
              await BluetoothEscposPrinter.printText(
                '================================================',
                {},
              );
              await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
            } catch (e) {
              alert(e.message || 'ERROR');
            }
          }}
        />
      </View>
    </View>
  );
};

export default SamplePrint;

const styles = StyleSheet.create({
  btn: {
    marginBottom: 8,
  },
});
