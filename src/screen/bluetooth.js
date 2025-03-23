import React, {useContext, useEffect, useState , useCallback} from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  NativeEventEmitter,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  ToastAndroid,
  View,
  Button,
  TouchableOpacity,
} from 'react-native';
import {BluetoothManager} from 'react-native-bluetooth-escpos-printer';
import {PERMISSIONS, requestMultiple, RESULTS} from 'react-native-permissions';
import ItemList from '../component/itemlist';
import SamplePrint from '../component/samplePrint';
import {styles} from '../component/styles';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {BluetoothContext} from '../BluetoothContext'; // Import the context
import Icon from 'react-native-vector-icons/MaterialIcons';

const BluetoothScreen = () => {
  const {boundAddress, name, connect, unPair, loading, restoreLastConnection} =
    useContext(BluetoothContext);
  const [pairedDevices, setPairedDevices] = useState([]);
  const [foundDs, setFoundDs] = useState([]);
  const [bleOpend, setBleOpend] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    BluetoothManager.isBluetoothEnabled().then(
      enabled => {
        setBleOpend(Boolean(enabled));
      },
      err => {
        console.error(err);
      },
    );

    if (Platform.OS === 'ios') {
      let bluetoothManagerEmitter = new NativeEventEmitter(BluetoothManager);
      bluetoothManagerEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
        rsp => {
          deviceAlreadPaired(rsp);
        },
      );
      bluetoothManagerEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_FOUND,
        rsp => {
          deviceFoundEvent(rsp);
        },
      );
    } else if (Platform.OS === 'android') {
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
        rsp => {
          deviceAlreadPaired(rsp);
        },
      );
      DeviceEventEmitter.addListener(
        BluetoothManager.EVENT_DEVICE_FOUND,
        rsp => {
          deviceFoundEvent(rsp);
        },
      );
    }
    if (pairedDevices.length < 1) {
      scan();
    }

    // Restore the last connected printer
    restoreLastConnection();
  }, [pairedDevices]);

  const deviceAlreadPaired = rsp => {
    var ds = null;
    if (typeof rsp.devices === 'object') {
      ds = rsp.devices;
    } else {
      try {
        ds = JSON.parse(rsp.devices);
      } catch (e) {}
    }
    if (ds && ds.length) {
      setPairedDevices(ds);
    }
  };

  const deviceFoundEvent = rsp => {
    var r = null;
    try {
      if (typeof rsp.device === 'object') {
        r = rsp.device;
      } else {
        r = JSON.parse(rsp.device);
      }
    } catch (e) {
      // ignore error
    }

    if (r) {
      let found = foundDs || [];
      if (found.findIndex) {
        let duplicated = found.findIndex(function (x) {
          return x.address == r.address;
        });
        if (duplicated == -1) {
          found.push(r);
          setFoundDs(found);
        }
      }
    }
  };

  const scanDevices = useCallback(() => {
    setLoading(true);
    BluetoothManager.scanDevices().then(
      s => {
        var found = s.found;
        try {
          found = JSON.parse(found);
        } catch (e) {
          //ignore
        }
        setFoundDs(found || []);
        setLoading(false);
      },
      er => {
        setLoading(false);
      },
    );
  }, []);

  const scan = useCallback(() => {
    try {
      async function blueTooth() {
        const permissions = {
          title: 'HSD Bluetooth Permission Request',
          message:
            'HSD Bluetooth needs access to Bluetooth to connect to the printer.',
          buttonNeutral: 'Ask Later',
          buttonNegative: 'No',
          buttonPositive: 'Yes',
        };

        const bluetoothConnectGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          permissions,
        );
        if (bluetoothConnectGranted === PermissionsAndroid.RESULTS.GRANTED) {
          const bluetoothScanGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            permissions,
          );
          if (bluetoothScanGranted === PermissionsAndroid.RESULTS.GRANTED) {
            scanDevices();
          }
        }
      }
      blueTooth();
    } catch (err) {
      console.warn(err);
    }
  }, [scanDevices]);

  const scanBluetoothDevice = async () => {
    setLoading(true);
    try {
      const request = await requestMultiple([
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ]);

      if (
        request['android.permission.ACCESS_FINE_LOCATION'] === RESULTS.GRANTED
      ) {
        scanDevices();
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connect Bluetooth</Text>
      </View>
      <View style={styles.bluetoothStatusContainer}>
        <Text style={styles.bluetoothStatus(bleOpend ? '#47BF34' : '#A8A9AA')}>
          Bluetooth {bleOpend ? 'Refresh' : 'Non Refresh'}
        </Text>
      </View>
      {!bleOpend && (
        <Text style={styles.bluetoothInfo}>Please enable your Bluetooth</Text>
      )}
      <Text style={styles.sectionTitle}>Printer Connect</Text>
      {boundAddress.length > 0 && (
        <ItemList
          label={name}
          value={boundAddress}
          onPress={() => unPair(boundAddress)}
          actionText="Paired"
          color="#E9493F"
        />
      )}
      {boundAddress.length < 1 && (
        <Text style={styles.printerInfo}>Connect Bluetooth</Text>
      )}
      <Text style={styles.sectionTitle}>Bluetooth All the list</Text>
      {loading ? <ActivityIndicator animating={true} /> : null}
      <View style={styles.containerList}>
        {pairedDevices.map((item, index) => {
          return (
            <ItemList
              key={index}
              onPress={() => connect(item.address, item.name)}
              label={item.name}
              value={item.address}
              connected={item.address === boundAddress}
              actionText="Pair"
              color="#00BCD4"
            />
          );
        })}
      </View>
      <SamplePrint />
      <Button onPress={() => scanBluetoothDevice()} title="Scan Bluetooth" />
      <View style={{height: 100}} />
    </ScrollView>
  );
};

export default BluetoothScreen;
