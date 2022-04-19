import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  NativeModules,
  NativeEventEmitter,
  Button,
  Platform,
  PermissionsAndroid,
  FlatList,
  TouchableHighlight,
  ToastAndroid,
  ActivityIndicator,
  Modal,
  TextInput,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import RNBluetoothClassic, {
  BluetoothEventType,
  BluetoothDevice,
} from 'react-native-bluetooth-classic';
import DeviceListScreen from './DeviceListScreen';
import ConnectionScreen from './ConnectionScreen';

const {width, height} = Dimensions.get('window');
const App = () => {
  const [loader, setLoader] = useState(false);
  const [logs, setLogs] = useState([]);
  const [bluetoothAvailable, setBluetoothAvailable] = useState(false);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [device, setDevice] = useState();
  const [devicePaired, setDevicePaired] = useState([]);
  const [deviceUnPaired, setDeviceUnPaired] = useState([]);
  const [deviceConnected, setDeviceConnected] = useState();
  const [connectedDevice, setConnectedDevice] = useState();

  useEffect(() => {
    if (!bluetoothAvailable) {
      bluetoothAvailableCheck();
    }
  }, [bluetoothAvailable]);

  useEffect(() => {
    console.log('\n\n\n USEFFECT');
    const enabledSubscription = RNBluetoothClassic.onBluetoothEnabled(event =>
      onStateChanged(event),
    );
    const disabledSubscription = RNBluetoothClassic.onBluetoothDisabled(event =>
      onStateChanged(event),
    );

    return () => {
      enabledSubscription.remove();
      disabledSubscription.remove();
    };
  }, []);
  const bluetoothFunc = async () => {
    var bluetoothPermission = false;

    setTimeout(() => {
      let arr = [];
      arr.push({title: 'Bluetooth permission check', id: Math.random()});
      setLogs(arr);
      ToastAndroid.show('Bluetooth permission check', ToastAndroid.SHORT);
    }, 855);

    await BluetoothStateManager.getState().then(async bluetoothState => {
      console.log('\n\n BLUETOOTH     ', bluetoothState);
      setLoader(true);
      if (bluetoothState === 'PoweredOn') {
        setBluetoothEnabled(true);
        bluetoothPermission = true;
        setTimeout(() => {
          let arr = [];
          arr.push({title: 'Bluetooth is on', id: Math.random()});
          setLogs(arr);
          ToastAndroid.show('Bluetooth is on', ToastAndroid.SHORT);
        }, 855);
        setLoader(false);
      } else if (bluetoothState === 'PoweredOff') {
        await BluetoothStateManager.enable().then(() => {
          setBluetoothEnabled(true);

          bluetoothPermission = true;
          setTimeout(() => {
            let arr = [];
            arr.push({title: 'Bluetooth is on', id: Math.random()});
            setLogs(arr);
            ToastAndroid.show('Bluetooth is on', ToastAndroid.SHORT);
          }, 855);
          setLoader(false);
        });
      } else {
        console.log('\n\n    BLUETOOTH IS ======', bluetoothState);
        bluetoothPermission = false;
        setBluetoothEnabled(false);

        setTimeout(() => {
          let arr = [];
          arr.push({title: 'Bluetooth ERROR bluetoothFunc', id: Math.random()});
          setLogs(arr);
          ToastAndroid.show(
            'Bluetooth ERROR bluetoothFunc',
            ToastAndroid.SHORT,
          );
        }, 855);
        setLoader(false);
      }
    });
  };
  const bluetoothAvailableCheck = async () => {
    try {
      let available = await RNBluetoothClassic.isBluetoothAvailable();
      if (available) {
        setBluetoothAvailable(true);
        setTimeout(() => {
          let arr = [];
          arr.push({title: 'Bluetooth available', id: Math.random()});
          setLogs(arr);
          ToastAndroid.show('Bluetooth available', ToastAndroid.SHORT);
          console.log('\n\n Bluetooth available');
        }, 855);
        bluetoothEnableCheck();
      } else {
        setBluetoothAvailable(false);
        setTimeout(() => {
          let arr = [];
          arr.push({title: 'Bluetooth not available', id: Math.random()});
          setLogs(arr);
          ToastAndroid.show('Bluetooth not available', ToastAndroid.SHORT);
          console.log('\n\n Bluetooth not available');
        }, 855);
      }
    } catch (err) {
      setBluetoothAvailable(false);
      setTimeout(() => {
        let arr = [];
        arr.push({
          title: 'Bluetooth error bluetoothAvailableCheck',
          id: Math.random(),
        });
        setLogs(arr);
        ToastAndroid.show(
          'Bluetooth error bluetoothAvailableCheck',
          ToastAndroid.SHORT,
        );
        console.log('\n\n Bluetooth error bluetoothAvailableCheck', err);
      }, 855);
    }
  };
  const bluetoothEnableCheck = async () => {
    try {
      let available = await RNBluetoothClassic.isBluetoothEnabled();
      if (available) {
        setBluetoothEnabled(true);
        setTimeout(() => {
          let arr = [];
          arr.push({title: 'Bluetooth enabled', id: Math.random()});
          setLogs(arr);
          ToastAndroid.show('Bluetooth enabled', ToastAndroid.SHORT);
          console.log('\n\n Bluetooth enabled');
        }, 855);
        bondedDevices();
      } else {
        setBluetoothEnabled(false);
        setTimeout(() => {
          let arr = [];
          arr.push({title: 'Bluetooth disabled', id: Math.random()});
          setLogs(arr);
          ToastAndroid.show('Bluetooth disabled', ToastAndroid.SHORT);
          bluetoothFunc();
          console.log('\n\n Bluetooth disabled');
        }, 855);
      }
    } catch (err) {
      setBluetoothEnabled(false);
      setTimeout(() => {
        let arr = [];
        arr.push({
          title: 'Bluetooth error bluetoothEnableCheck',
          id: Math.random(),
        });
        setLogs(arr);
        ToastAndroid.show(
          'Bluetooth error bluetoothEnableCheck',
          ToastAndroid.SHORT,
        );
        console.log('\n\n Bluetooth error bluetoothEnableCheck', err);
      }, 855);
    }
  };
  const onStateChanged = stateChangedEvent => {
    console.log('App::onStateChanged called with: ', stateChangedEvent);
    setBluetoothEnabled(stateChangedEvent.enabled);
    setDevice(stateChangedEvent.enabled ? device : undefined);
  };
  const selectDevice = device => {
    console.log('App::selectDevice() called with: ', device);
    setDevice(device);
  };
  const bondedDevices = async () => {
    // if (bluetoothEnabled) {
    try {
      let paired = await RNBluetoothClassic.getBondedDevices();
      console.log('\n\n PAIRED DEVICES', paired);
      setDevicePaired(paired);
      connectedDevices();
    } catch (err) {
      setTimeout(() => {
        let arr = [];
        arr.push({title: 'No bonded devices', id: Math.random()});
        setLogs(arr);
        ToastAndroid.show('No bonded devices', ToastAndroid.SHORT);
        console.log('\n\n No bonded devices', err);
      }, 855);
    }
    // } else {
    //   setTimeout(() => {
    //     let arr = [];
    //     arr.push({title: 'Bluetooth disabled bondedDevices', id: Math.random()});
    //     setLogs(arr);
    //     ToastAndroid.show('Bluetooth disabled bondedDevices', ToastAndroid.SHORT);
    //     console.log('\n\n Bluetooth disabled bondedDevices');
    //   }, 855);
    // }
  };
  const connectedDevices = async () => {
    console.log('\n\n IN CONNECTED DEVICES');
    try {
      let connected = await RNBluetoothClassic.getConnectedDevices();
      console.log('connected device ', connected);
      if (connected) {
        setConnectedDevice(connected);
      } else {
        setTimeout(() => {
          let arr = [];
          arr.push({title: 'No connected devices', id: Math.random()});
          setLogs(arr);
          ToastAndroid.show('No connected devices', ToastAndroid.SHORT);
          console.log('\n\n No connected devices');
        }, 855);
      }
    } catch (err) {
      setTimeout(() => {
        let arr = [];
        arr.push({title: 'No connected devices', id: Math.random()});
        setLogs(arr);
        ToastAndroid.show('No connected devices', ToastAndroid.SHORT);
        console.log('\n\n No connected devices', err);
      }, 855);
    }
  };
  const discoverDevices = async () => {
    try {
      let granted = await requestAccessFineLocationPermission();

      if (!granted) {
        throw new Error(`Access fine location was not granted`);
      }

      setDiscovering(true);
      let device = [...devicePaired];
      setLoader(true);
      try {
        let unpaired = await RNBluetoothClassic.startDiscovery();
        console.log('\n\n\n UNPAIRED', unpaired);
        setDeviceUnPaired(unpaired);
        ToastAndroid.show(
          'Found ' + unpaired.length + ' unpaired devices',
          ToastAndroid.SHORT,
        );
        // ToastAndroid.show({
        //   text: `Found ${unpaired.length} unpaired devices.`,
        //   duration: 2000,
        // });
      } finally {
        // setDevicePaired(device);
        setDiscovering(false);
        setLoader(false);
      }
    } catch (err) {
      setLoader(false);

      ToastAndroid.show('ERROR ', `${err.message}`, ToastAndroid.SHORT);
    }
  };
  const acceptConnections = async () => {
    let connection = await RNBluetoothClassic.accept({delimiter: '\r'});
    console.log('\n\n\n CONNECTION RNBluetoothModule.accept ', connection);
  };
  const requestAccessFineLocationPermission = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Access fine location required for discovery',
        message:
          'In order to perform discovery, you must enable/allow ' +
          'fine location access.',
        buttonNeutral: 'Ask Me Later"',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };
  const searchFunc = val => {
    if (val) {
      let filteredData = list.filter(
        find =>
          String(find.id).toLowerCase().includes(val) ||
          String(find.id).includes(val) ||
          String(find.fulidlname).toUpperCase().includes(val),
      );
      setDuplicatedata(filteredData);
      // console.log('FILTERD', filteredData);
    } else if (val === '') {
      setDuplicatedata(list);
    }
  };
  const connectDevice = async item => {
    console.log('\n\n\n CONNECT DEVICE ', item);
    let alreadyConnected = await item.isConnected();
    console.log('\n\n\n ALREADY CONNECTED ', alreadyConnected);
    if (!alreadyConnected) {
      setLoader(true);
      try {
        let device = await RNBluetoothClassic.connectToDevice(item.id, {});
        console.log('\n\n\n CONNECTION device ', item);
        let deviceConnect = await item.connect({
          secureSocket: false,
          // connectorType: 'rfcomm',
          delimiter: '',
          // deviceCharset: Platform.OS === 'ios' ? 1536 : 'utf-8',
        });
        console.log(
          '\n\n\n CONNECTION RNBluetoothModule.connectToDevice ',
          deviceConnect,
        );
        if (deviceConnect) {
          setLoader(false);
          let arr = [];
          arr.push(item);
          setConnectedDevice(arr);
          console.log('\n\n\n CONNECTED TO DEVICE ', deviceConnect, item);
          await item.write('Foo', 'ascii');
          console.log('\n\n\n   Avaialble device === ', await item.available());
          setTimeout(() => {
            let arr = [];
            arr.push({title: 'Connected to ' + item.name, id: Math.random()});
            setLogs(arr);
            ToastAndroid.show('Connected to ' + item.name, ToastAndroid.SHORT);
          }, 855);
          const reWrite = await RNBluetoothClassic.writeToDevice(
            item.id,
            'Foo',
          );
          console.log(
            '\n\n\n writeToDevice === ',
            reWrite,
            '   \n  ',
            item.id,
            item.name,
            'foo',
          );
          setTimeout(async () => {
            const read = await RNBluetoothClassic.readFromDevice(item.id);
            console.log('\n\n\n read === ', read, '   \n  ', item.id);
          }, 2000);
          const event = await item.onDataReceived(data => {
            console.log('\n\n\n onDataReceived DATA ', data);
            console.log(
              '\n\n\n READ DATA onDataReceived stringify' +
                JSON.stringify(data),
            );
            ToastAndroid.show(
              'READ DATA onDataReceived' + JSON.stringify(data),
              ToastAndroid.SHORT,
            );
            let arr = [];
            arr.push({
              title: 'READ DATA onDataReceived' + JSON.stringify(data),
              id: Math.random(),
            });
            setLogs(arr);
          });

          let message = await item.read();
          //   console.log('\n\n\n READ DATA ', message);

          console.log('\n\n\n READ DATA message ===  ', message);
          ToastAndroid.show(
            'READ DATA' + JSON.stringify(message),
            ToastAndroid.SHORT,
          );
          let array_ = [];
          array_.push({
            title: 'READ DATA' + JSON.stringify(message),
            id: Math.random(),
          });
          setLogs(array_);
        } else {
          setLoader(false);
          setTimeout(() => {
            let arr = [];
            arr.push({
              title: "Didn't Connected to " + item.name,
              id: Math.random(),
            });
            setLogs(arr);
            ToastAndroid.show(
              "Didn't Connected to " + item.name,
              ToastAndroid.SHORT,
            );
          }, 855);
        }
      } catch (err) {
        if (
          err.message.toString() ===
          'java.io.IOException: read failed, socket might closed or timeout, read ret: -1'
        ) {
          console.log(
            '\n\n\n ACCEPT PRESS KARO /////\\\\\\\\/////\\\\////// ß\n',
          );
          setLoader(false);
          console.log(
            '\n\n\n ERROR CONNECTION RNBluetoothModule.connectToDevice ',
            err,
            'message === ',
            err.message,
          );
          ToastAndroid.show('Try Again', ToastAndroid.SHORT);
          let arr = [];
          arr.push({
            title: 'Try Again ',
            id: Math.random(),
          });
          setLogs(arr);
        } else {
          setLoader(false);
          console.log(
            '\n\n\n ERROR CONNECTION RNBluetoothModule.connectToDevice ',
            err,
            'message === ',
            err.message,
          );
          ToastAndroid.show(
            'ERROR ' + err.message.toString(),
            ToastAndroid.SHORT,
          );
          let arr = [];
          arr.push({
            title: 'ERROR ' + err.message,
            id: Math.random(),
          });
          setLogs(arr);
        }
      }
    } else {
      setLoader(false);
      let arr = [];
      arr.push({
        title: 'Already connected to ' + item.name,
        id: Math.random(),
      });
      setLogs(arr);
      // let array = [];
      // array.push(item);
      // setConnectedDevice(array);
      ToastAndroid.show(
        'Already connected to ' + item.name,
        ToastAndroid.SHORT,
      );
    }
  };
  const connectDevice2 = async item => {
    try {
      let device = await RNBluetoothClassic.connectToDevice(item.id, {
        delimiter:"\r",
        secureSocket:false
      });
      // await device.connect({secureSocket: false,
      
      // delimiter:"f"
      
      // });
      await device.write('Foo', 'ascii'); // 'Foo' is received in raspberry pi
      console.log('\n\n available ===  ', await device.available()); // Logs '0'
      await device.onDataReceived(res =>
        console.log('\n\n  connectDevice2 onDataReceived === ', res),
      ); // Does not log anything

      // setInterval(async () => {
        let readData = await device.read();
        console.log('\n\n  connectDevice2 readData  === ', readData); // Logs 'null'
      // }, 1200);
    } catch (e) {
      console.log('\n\n  connectDevice2 Error === ', e);
    }
  };
  const pairDevice = async device => {
    try {
      let pair = await RNBluetoothClassic.pair(device.id);
      console.log('\n\n PAIR DEVICE', pair);
      bondedDevices();
    } catch (err) {
      console.log('\n\n\n ERROR PAIR DEVICE', err);
    }
  };
  const renderDevices = ({item, index}) => {
    return (
      <TouchableOpacity
        style={styles.flatview}
        onPress={() => {
          console.log('\n\n ITEM PRESSED   ', item);
          connectDevice2(item);
        }}>
        <Text style={styles.flattext}>{`Name:  ` + item.name.toString()}</Text>
        <Text style={styles.flattext}>
          {`MAC:  ` + item.address.toString()}
        </Text>
        <Text style={styles.flattext}>
          {`Bonded:  ` + item.bonded.toString()}
        </Text>
      </TouchableOpacity>
    );
  };
  const renderDevicesUnpaired = ({item, index}) => {
    return (
      <TouchableOpacity
        style={styles.flatview}
        onPress={() => {
          console.log('\n\n ITEM PRESSED   ', item);
          pairDevice(item);
        }}>
        <Text style={styles.flattext}>{`Name:  ` + item.name.toString()}</Text>
        <Text style={styles.flattext}>
          {`MAC:  ` + item.address.toString()}
        </Text>
        <Text style={styles.flattext}>
          {`Bonded:  ` + item.bonded.toString()}
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.scrollView}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={'#fff'}
        transparent={true}
      />
      <SafeAreaView>
        <Text
          style={{
            alignSelf: 'center',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: 25,
            color: '#000',
          }}>
          LOGS:
        </Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
          <TouchableOpacity
            style={styles.discovered}
            disabled={!bluetoothAvailable || !bluetoothEnabled || discovering}
            onPress={() => {
              console.log('\n\n DISCOVERED DEVICES');
              discoverDevices();
            }}>
            <Text style={styles.btntxt}>Discover Devices</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.discovered}
            disabled={!bluetoothAvailable || !bluetoothEnabled || discovering}
            onPress={() => {
              console.log('\n\n ACCEPT CONNECTIONS');
              acceptConnections();
            }}>
            <Text style={styles.btntxt}>Accept Connections</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={logs}
          renderItem={({item, index}) => {
            return (
              <View style={{margin: 10, marginTop: 5}}>
                <Text
                  style={{
                    alignSelf: 'center',
                    textAlign: 'center',
                    fontSize: 16,
                    color: '#000',
                    fontWeight: 'bold',
                  }}>
                  LOGS: {item.title}
                </Text>
              </View>
            );
          }}
          keyExtractor={item => item.id}
          ListEmptyComponent={() => (
            <View style={{flex: 1, margin: 20}}>
              <Text style={{textAlign: 'center'}}>No LOGS</Text>
            </View>
          )}
        />
        <FlatList
          data={deviceUnPaired}
          renderItem={renderDevicesUnpaired}
          ListEmptyComponent={() => (
            <View>
              <Text style={styles.flattext}> NO Un Paired Devices</Text>
            </View>
          )}
          ListHeaderComponent={() => (
            <View>
              <Text style={styles.btntxtbold}>Un Paired Devices</Text>
            </View>
          )}
        />
        <FlatList
          data={devicePaired}
          renderItem={renderDevices}
          ListHeaderComponent={() => (
            <View>
              <Text style={styles.btntxtbold}>Paired Devices</Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View>
              <Text style={styles.flattext}> NO Paired Devices</Text>
            </View>
          )}
        />
        <View>
          <Text style={[styles.btntxtbold, {marginTop: 40}]}>
            Connected Devices
          </Text>
          <TouchableOpacity
            style={styles.connected}
            onPress={() => {
              connectedDevices();
            }}>
            <Text style={styles.btntxt}>Check Connected Devices</Text>
          </TouchableOpacity>
        </View>
        {connectedDevice && connectedDevice.length ? (
          <View style={[styles.flatview, {marginBottom: 70}]}>
            <Text style={[styles.flattext, {marginTop: 28}]}>
              Name: {connectedDevice[0]?.name}
            </Text>
            <Text style={[styles.flattext, {marginTop: 7}]}>
              MAC: {connectedDevice[0]?.id}
            </Text>
            <Text style={[styles.flattext, {marginTop: 7}]}>
              Connected: true
            </Text>
          </View>
        ) : null}
        <View style={{flexDirection: 'row', alignSelf: 'center'}}>
          <TouchableOpacity
            style={styles.connected}
            onPress={() => {
              // connectedDevices();
            }}>
            <Text style={styles.btntxt}>Read Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.connected}
            onPress={async () => {
              console.log('\n\n\n WRITE DATA ');

              //   connectedDevices();
            }}>
            <Text style={styles.btntxt}>Write Data</Text>
          </TouchableOpacity>
        </View>
        {/* <FlatList
          data={deviceConnected}
          renderItem={renderDevices}
          ListHeaderComponent={() => (
            <View>
              <Text style={[styles.btntxtbold, {marginTop: 40}]}>
                Connected Devices
              </Text>
              <TouchableOpacity
                style={styles.connected}
                onPress={() => {
                  connectedDevices();
                }}>
                <Text style={styles.btntxt}>Check Connected Devices</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={() => (
            <View>
              <Text style={styles.flattext}> NO Connected Devices</Text>
            </View>
          )}
        /> */}
        {/* {!device ? (
          <DeviceListScreen
            bluetoothEnabled={bluetoothEnabled}
            selectDevice={selectDevice}
          />
        ) : (
          <ConnectionScreen
            device={device}
            onBack={() => setDevice(undefined)}
          />
        )} */}
        <Modal visible={loader} transparent={true}>
          <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.33)'}}>
            <ActivityIndicator
              size={'large'}
              style={{marginTop: 300}}
              color={'#367805'}></ActivityIndicator>
          </View>
        </Modal>
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  flatview: {
    width: '90%',
    backgroundColor: '#e4e8e1',
    margin: 8,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    borderRadius: 5,
  },
  flattext: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  connected: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 10,
    backgroundColor: '#4ba10a',
    padding: 5,
    borderRadius: 5,
    elevation: 8,
  },
  discovered: {
    alignSelf: 'center',

    marginTop: 10,
    backgroundColor: '#367805',
    padding: 5,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    elevation: 8,
  },
  btntxt: {
    alignSelf: 'center',
    textAlign: 'center',
    color: '#fff',
  },
  btntxtbold: {
    alignSelf: 'center',
    textAlign: 'center',
    color: '#000',
    fontWeight: 'bold',
    fontSize: 23,
    marginTop: 10,
  },
});

export default App;
