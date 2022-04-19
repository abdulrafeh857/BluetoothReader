import React from 'react';
import {Platform} from 'react-native';
import {
  Body,
  Container,
  Content,
  Button,
  Text,
  Icon,
  Right,
  Toast,
  Header,
  Title,
} from 'native-base';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import {
  PermissionsAndroid,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

/**
 * See https://reactnative.dev/docs/permissionsandroid for more information
 * on why this is required (dangerous permissions).
 */
const requestAccessFineLocationPermission = async () => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Access fine location required for discovery',
      message:
        'In order to perform discovery, you must enable/allow ' +
        'fine location access.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

/**
 * Displays the device list and manages user interaction.  Initially
 * the NativeDevice[] contains a list of the bonded devices.  By using
 * the Discover Devices action the list will be updated with unpaired
 * devices.
 *
 * From here:
 * - unpaired devices can be paired
 * - paired devices can be connected
 *
 * @author kendavidson
 *
 */
const DeviceListScreen = ({bluetoothEnabled, selectDevice}) => {
  const [devices, setDevices] = React.useState([]);
  const [accepting, setAccepting] = React.useState(false);
  const [discovering, setDiscovering] = React.useState(false);

  React.useEffect(() => {
    getBondedDevices();
    return () => {
      if (accepting) {
        cancelAcceptConnections(false);
      }

      if (discovering) {
        cancelDiscovery(false);
      }
    };
  }, []);

  /**
   * Gets the currently bonded devices.
   */
  const getBondedDevices = async unloading => {
    console.log('DeviceListScreen::getBondedDevices');
    try {
      let bonded = await RNBluetoothClassic.getBondedDevices();
      console.log('DeviceListScreen::getBondedDevices found', bonded);

      if (!unloading) {
        setDevices(bonded);
      }
    } catch (error) {
      setDevices([]);

      Toast.show({
        text: error.message,
        duration: 5000,
      });
    }
  };

  /**
   * Starts attempting to accept a connection.  If a device was accepted it will
   * be passed to the application context as the current device.
   */
  const acceptConnections = async () => {
    if (accepting) {
      Toast.show({
        text: 'Already accepting connections',
        duration: 5000,
      });

      return;
    }
    setAccepting(true);

    try {
      let device = await RNBluetoothClassic.accept({delimiter: '\r'});
      if (device) {
        selectDevice(device);
      }
    } catch (error) {
      // If we're not in an accepting state, then chances are we actually
      // requested the cancellation.  This could be managed on the native
      // side but for now this gives more options.
      if (!accepting) {
        Toast.show({
          text: 'Attempt to accept connection failed.',
          duration: 5000,
        });
      }
    } finally {
      setAccepting(false);
    }
  };

  /**
   * Cancels the current accept - might be wise to check accepting state prior
   * to attempting.
   */
  const cancelAcceptConnections = async () => {
    if (!accepting) {
      return;
    }

    try {
      let cancelled = await RNBluetoothClassic.cancelAccept();
      setAccepting(!cancelled);
    } catch (error) {
      Toast.show({
        text: 'Unable to cancel accept connection',
        duration: 2000,
      });
    }
  };

  const startDiscovery = async () => {
    try {
      let granted = await requestAccessFineLocationPermission();

      if (!granted) {
        throw new Error('Access fine location was not granted');
      }
      console.log('discovering...');
      setDiscovering(true);

      let device = [...devices];

      try {
        let unpaired = await RNBluetoothClassic.startDiscovery();

        let index = device.findIndex(d => !d.bonded);
        if (index >= 0) {
          device.splice(index, device.length - index, ...unpaired);
        } else {
          device.push(...unpaired);
        }

        Toast.show({
          text: `Found ${unpaired.length} unpaired devices.`,
          duration: 2000,
        });
      } finally {
        setDevices(device);
        setDiscovering(false);
      }
    } catch (err) {
      Toast.show({
        text: err.message,
        duration: 2000,
      });
    }
  };

  const cancelDiscovery = async () => {
    try {
    } catch (error) {
      Toast.show({
        text: 'Error occurred while attempting to cancel discover devices',
        duration: 2000,
      });
    }
  };

  const requestEnabled = async () => {
    try {
      alert('read the documentation and see how to  enable bluetooth device');
    } catch (error) {
      Toast.show({
        text: `Error occurred while enabling bluetooth: ${error.message}`,
        duration: 200,
      });
    }
  };

  const toggleAccept = () => {
    if (accepting) {
      cancelAcceptConnections();
    } else {
      acceptConnections();
    }
  };

  const toggleDiscovery = () => {
    console.log('toggle discovering');
    if (discovering) {
      cancelDiscovery();
    } else {
      startDiscovery();
    }
  };

  return (
    <Container>
      <Header iosBarStyle="light-content">
        <Body>
          <Title>Devices</Title>
        </Body>
        {bluetoothEnabled ? (
          <Right>
            <Button transparent onPress={this.getBondedDevices}>
              <Icon type="Ionicons" name="md-sync" />
            </Button>
          </Right>
        ) : undefined}
      </Header>
      {bluetoothEnabled ? (
        <>
          <DeviceList devices={devices} onPress={selectDevice} />
          {Platform.OS !== 'ios' ? (
            <View>
              {/* <Button block onPress={() => toggleAccept()}>
                <Text>
                  {accepting ? 'Accepting (cancel)...' : 'Accept Connection'}
                </Text>
              </Button> */}
              <Button block onPress={() => toggleDiscovery()}>
                <Text>
                  {discovering ? 'Discovering (cancel)...' : 'Discover Devices'}
                </Text>
              </Button>
            </View>
          ) : undefined}
        </>
      ) : (
        <Content contentContainerStyle={styles.center}>
          <Text>Bluetooth is OFF</Text>
          <Button onPress={() => requestEnabled()}>
            <Text>Enable Bluetooth</Text>
          </Button>
        </Content>
      )}
    </Container>
  );
};

/**
 * Displays a list of Bluetooth devices.
 *
 * @param {NativeDevice[]} devices
 * @param {function} onPress
 * @param {function} onLongPress
 */
export const DeviceList = ({devices, onPress, onLongPress}) => {
  const renderItem = ({item}) => {
    console.log('item');
    console.log(item);
    return (
      <DeviceListItem
        device={item}
        onPress={onPress}
        onLongPress={onLongPress}
      />
    );
  };

  return (
    <FlatList
      data={devices}
      renderItem={renderItem}
      keyExtractor={item => (item ? item.address : 'key')}
    />
  );
};

export const DeviceListItem = ({device, onPress, onLongPress}) => {
  let bgColor = device?.connected ? '#0f0' : '#fff';
  let icon = device.bonded ? 'ios-bluetooth' : 'ios-cellular';

  return (
    <TouchableOpacity
      onPress={() => onPress(device)}
      onLongPress={() => onLongPress(device)}
      style={styles.deviceListItem}>
      <View style={styles.deviceListItemIcon}>
        <Icon type="Ionicons" name={icon} color={bgColor} />
      </View>
      <View>
        <Text>{device.name}</Text>
        <Text note>{device.address}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  deviceListItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  deviceListItemIcon: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default DeviceListScreen;
