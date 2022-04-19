/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-unused-vars */
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

import BleManager from 'react-native-ble-manager';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const {width, height} = Dimensions.get('window');
const App = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [loader, setLoader] = useState(false);
  const peripherals = new Map();
  const [list, setList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [mac, setMac] = useState('');
  const [duplicateData, setDuplicatedata] = useState();
  const [isDataRetrieved, setIsDataRetrieved] = useState(true);
  const [dataRetrieved, setDataRetrieved] = useState();
  // console.log('\n\n ITEM  ', logs);
  useEffect(() => {
    bluetoothFunc();
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
        setTimeout(() => {
          let arr = [];
          arr.push({title: 'Bluetooth ERROR', id: Math.random()});
          setLogs(arr);
          ToastAndroid.show('Bluetooth ERROR', ToastAndroid.SHORT);
        }, 855);
        setLoader(false);
      }
    });
  };
  const startScan = () => {
    console.log(' \n\n\n \n\n\n   iN startScan...');
    setTimeout(() => {
      let arr = [];
      arr.push({title: 'IN SCAN', id: Math.random()});
      setLogs(arr);
      ToastAndroid.show('IN SCAN', ToastAndroid.SHORT);
    }, 855);
    if (!isScanning) {
      setLoader(true);

      console.log(' \n\n\n \n\n\n   isScanning  ====', isScanning);
      setTimeout(() => {
        let arr = [];
        arr.push({title: 'SCAN STARTED', id: Math.random()});
        setLogs(arr);
        ToastAndroid.show('SCAN STARTED', ToastAndroid.SHORT);
      }, 855);
      BleManager.scan([], 3, false)
        .then(results => {
          setLoader(false);

          console.log(' \n\n\n \n\n\n  Scanning...', results);
          setIsScanning(true);
          setTimeout(() => {
            let arr = [];
            arr.push({title: 'SCAN SUCCESS', id: Math.random()});
            setLogs(arr);
            ToastAndroid.show('SCAN SUCCESS', ToastAndroid.SHORT);
          }, 855);
        })
        .catch(err => {
          setLoader(false);
          setTimeout(() => {
            let arr = [];
            arr.push({title: 'SCAN ERROR', id: Math.random()});
            setLogs(arr);
            ToastAndroid.show('SCAN ERROR', ToastAndroid.SHORT);
          }, 855);
          console.error('\n\n ERROR FROM SCAN  ', err);
        });
    } else {
      setLoader(false);

      ToastAndroid.show('Scanning already started', ToastAndroid.SHORT);
      console.log('\n\n\n Scanning already started');
    }
  };
  const startConnect = () => {
    console.log(' \n\n\n \n\n\n   iN CONNECT...');
    setTimeout(() => {
      let arr = [];
      arr.push({title: 'IN CONNECT', id: Math.random()});
      setLogs(arr);
      ToastAndroid.show('IN CONNECT', ToastAndroid.SHORT);
    }, 855);
    setLoader(true);
    console.log(' \n\n\n mac connect ', mac);
    setTimeout(() => {
      let arr = [];
      arr.push({title: 'DEVICE TRYING TO CONNECT', id: Math.random()});
      setLogs(arr);
      ToastAndroid.show('DEVICE TRYING TO CONNECT', ToastAndroid.SHORT);
    }, 855);
    BleManager.connect(mac)
      .then(() => {
        setTimeout(() => {
          let arr = [];
          arr.push({
            title: 'DEVICE CONNECTED SUCCESSFULLY ',
            id: Math.random(),
          });
          setLogs(arr);
          ToastAndroid.show(
            'DEVICE CONNECTED SUCCESSFULLY ',
            ToastAndroid.SHORT,
          );
        }, 855);
        let p = peripherals.get(mac);
        setLoader(false);

        if (p) {
          console.log(' \n\n\n peripheral p ', p);

          p.connected = true;
          peripherals.set(mac, p);
          setList(Array.from(peripherals.values()));
          setTimeout(() => {
            let arr = [];
            arr.push({title: 'DEVICE PERIPHERAL FOUND', id: Math.random()});
            setLogs(arr);
            ToastAndroid.show('DEVICE PERIPHERAL FOUND', ToastAndroid.SHORT);
          }, 855);
        } else {
          console.log(' \n\n\n peripheral  not p ', p);
          setTimeout(() => {
            let arr = [];
            arr.push({
              title: 'DEVICE PERIPHERAL ID NOT FOUND',
              id: Math.random(),
            });
            setLogs(arr);
            ToastAndroid.show(
              'DEVICE PERIPHERAL ID NOT FOUND',
              ToastAndroid.SHORT,
            );
          }, 855);
        }
        console.log(' \n\n\n Connected to ' + mac);
        ToastAndroid.show('Connected to' + mac, ToastAndroid.LONG);
        setTimeout(() => {
          /* Test read current RSSI value */
          BleManager.retrieveServices(mac).then(peripheralData => {
            console.log(
              ' \n\n\n Retrieved peripheral services',
              peripheralData,
            );
            ToastAndroid.show(
              'DATA RECEIEVED' + JSON.stringify(peripheralData),
              ToastAndroid.LONG,
            );
            setDataRetrieved(peripheralData);
            setIsDataRetrieved(true);
          });

          // Test using bleno's pizza example
          // https://github.com/sandeepmistry/bleno/tree/master/examples/pizza
          /*
            BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
              console.log(peripheralInfo);
              var service = '13333333-3333-3333-3333-333333333337';
              var bakeCharacteristic = '13333333-3333-3333-3333-333333330003';
              var crustCharacteristic = '13333333-3333-3333-3333-333333330001';
              setTimeout(() => {
                BleManager.startNotification(peripheral.id, service, bakeCharacteristic).then(() => {
                  console.log(' \n\n\n Started notification on ' + peripheral.id);
                  setTimeout(() => {
                    BleManager.write(peripheral.id, service, crustCharacteristic, [0]).then(() => {
                      console.log(' \n\n\n Writed NORMAL crust');
                      BleManager.write(peripheral.id, service, bakeCharacteristic, [1,95]).then(() => {
                        console.log(' \n\n\n Writed 351 temperature, the pizza should be BAKED');
                        //var PizzaBakeResult = {
                        //  HALF_BAKED: 0,
                        //  BAKED:      1,
                        //  CRISPY:     2,
                        //  BURNT:      3,
                        //  ON_FIRE:    4
                        //};
                      });
                    });
                  }, 500);
                }).catch((error) => {
                  console.log(' \n\n\n Notification error', error);
                });
              }, 200);
            });*/
        }, 900);
      })
      .catch(error => {
        console.log(' \n\n\n Connection error', error);
        setLoader(false);

        setTimeout(() => {
          let arr = [];
          arr.push({title: 'CONNECTION ERROR', id: Math.random()});
          setLogs(arr);
          ToastAndroid.show('CONNECTION ERROR', ToastAndroid.SHORT);
        }, 855);
      });
  };
  const handleStopScan = () => {
    console.log(' \n\n\n Scan is stopped');
    setTimeout(() => {
      let arr = [];
      arr.push({title: 'SCAN STOPPED', id: Math.random()});
      setLogs(arr);
      ToastAndroid.show('SCAN STOPPED', ToastAndroid.SHORT);
    }, 855);
    setIsScanning(false);
  };

  const handleDisconnectedPeripheral = data => {
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      setList(Array.from(peripherals.values()));
    }
    setTimeout(() => {
      let arr = [];
      arr.push({title: 'DEVICE DISCONNECTED', id: Math.random()});
      setLogs(arr);
      ToastAndroid.show('DEVICE DISCONNECTED', ToastAndroid.SHORT);
    }, 855);
    //  console.log(' \n\n\n Disconnected from ' + data.peripheral);
  };

  const handleUpdateValueForCharacteristic = data => {
    console.log(
      'Received data from ' +
        data.peripheral +
        ' characteristic ' +
        data.characteristic,
      data.value,
    );
    setTimeout(() => {
      let arr = [];
      arr.push({title: 'DATA RETRIEVED', id: Math.random()});
      setLogs(arr);
      ToastAndroid.show('DATA RETRIEVED', ToastAndroid.SHORT);
    }, 855);
  };

  const retrieveConnected = () => {
    BleManager.getConnectedPeripherals([]).then(results => {
      if (results.length == 0) {
        console.log(' \n\n\n No connected peripherals');
        setTimeout(() => {
          let arr = [];
          arr.push({title: 'NO DEVICE RETRIEVED', id: Math.random()});
          setLogs(arr);
          ToastAndroid.show('NO DEVICE RETRIEVED', ToastAndroid.SHORT);
        }, 855);
      }
      console.log('\n\n\n results retrieveConnected', results);
      console.log(
        '\n\n\n results retrieveConnected',
        results[0]?.advertising?.manufacturerData,
      );
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setList(Array.from(peripherals.values()));
      }
      setTimeout(() => {
        let arr = [];
        arr.push({
          title: `DEVICE RETRIEVED ${results.length}`,
          id: Math.random(),
        });
        setLogs(arr);
        ToastAndroid.show(
          `DEVICE RETRIEVED ${results.length}`,
          ToastAndroid.SHORT,
        );
      }, 855);
    });
  };

  const handleDiscoverPeripheral = peripheral => {
    if (peripheral.advertising.isConnectable) {
      console.log(' \n\n\n Got ble peripheral', peripheral);
    }
    if (peripheral.name == null) {
      peripheral.name = 'NO NAME';
    }
    peripherals.set(peripheral.id, peripheral);
    setList(Array.from(peripherals.values()));
    setTimeout(() => {
      let arr = [];
      arr.push({title: 'DEVICE(S) DISCOVERED', id: Math.random()});
      setLogs(arr);
      ToastAndroid.show('DEVICE(S) DISCOVERED', ToastAndroid.SHORT);
    }, 855);
    // console.log('\n\n LIST', list);
  };

  const testPeripheral = peripheral => {
    console.log(' \n\n\n peripheral', peripheral);

    if (peripheral) {
      if (peripheral.connected) {
        BleManager.disconnect(peripheral.id);
        console.log(' \n\n\n peripheral disconnect ', peripheral);
        setTimeout(() => {
          let arr = [];
          arr.push({title: 'DEVICE DISCONNECTED', id: Math.random()});
          setLogs(arr);
          ToastAndroid.show('DEVICE DISCONNECTED', ToastAndroid.SHORT);
        }, 855);
      } else {
        setLoader(true);
        console.log(' \n\n\n peripheral connect ', peripheral);
        setTimeout(() => {
          let arr = [];
          arr.push({title: 'DEVICE TRYING TO CONNECT', id: Math.random()});
          setLogs(arr);
          ToastAndroid.show('DEVICE TRYING TO CONNECT', ToastAndroid.SHORT);
        }, 855);
        BleManager.connect(peripheral.id)
          .then(() => {
            setTimeout(() => {
              let arr = [];
              arr.push({
                title: 'DEVICE CONNECTED SUCCESSFULLY ',
                id: Math.random(),
              });
              setLogs(arr);
              ToastAndroid.show(
                'DEVICE CONNECTED SUCCESSFULLY ',
                ToastAndroid.SHORT,
              );
            }, 855);
            let p = peripherals.get(peripheral.id);
            setLoader(false);

            if (p) {
              console.log(' \n\n\n peripheral p ', p);

              p.connected = true;
              peripherals.set(peripheral.id, p);
              setList(Array.from(peripherals.values()));
              setTimeout(() => {
                let arr = [];
                arr.push({title: 'DEVICE PERIPHERAL FOUND', id: Math.random()});
                setLogs(arr);
                ToastAndroid.show(
                  'DEVICE PERIPHERAL FOUND',
                  ToastAndroid.SHORT,
                );
              }, 855);
            } else {
              console.log(' \n\n\n peripheral  not p ', p);
              setTimeout(() => {
                let arr = [];
                arr.push({
                  title: 'DEVICE PERIPHERAL NOT FOUND',
                  id: Math.random(),
                });
                setLogs(arr);
                ToastAndroid.show(
                  'DEVICE PERIPHERAL NOT FOUND',
                  ToastAndroid.SHORT,
                );
              }, 855);
            }
            console.log(' \n\n\n Connected to ' + peripheral.id);

            setTimeout(() => {
              /* Test read current RSSI value */
              BleManager.retrieveServices(peripheral.id).then(
                peripheralData => {
                  console.log(
                    ' \n\n\n Retrieved peripheral services',
                    peripheralData,
                  );
                  ToastAndroid.show(
                    'DATA RECEIEVED' + JSON.stringify(peripheralData),
                    ToastAndroid.LONG,
                  );
                  setDataRetrieved(peripheralData);
                  setIsDataRetrieved(true);
                  BleManager.readRSSI(peripheral.id).then(rssi => {
                    console.log(' \n\n\n Retrieved actual RSSI value', rssi);
                    let p = peripherals.get(peripheral.id);
                    if (p) {
                      p.rssi = rssi;
                      peripherals.set(peripheral.id, p);
                      setList(Array.from(peripherals.values()));
                      console.log(' \n\n\n peripheral p readRSSI ', p);
                      setTimeout(() => {
                        let arr = [];
                        arr.push({title: 'DEVICE RSSI', id: Math.random()});
                        setLogs(arr);
                        ToastAndroid.show('DEVICE RSSI', ToastAndroid.SHORT);
                      }, 855);
                    } else {
                      console.log(' \n\n\n peripheral  not p readRSSI ', p);

                      setTimeout(() => {
                        let arr = [];
                        arr.push({title: 'NO DEVICE RSSI', id: Math.random()});
                        setLogs(arr);
                        ToastAndroid.show('NO DEVICE RSSI', ToastAndroid.SHORT);
                      }, 855);
                    }
                  });
                },
              );

              // Test using bleno's pizza example
              // https://github.com/sandeepmistry/bleno/tree/master/examples/pizza
              /*
            BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
              console.log(peripheralInfo);
              var service = '13333333-3333-3333-3333-333333333337';
              var bakeCharacteristic = '13333333-3333-3333-3333-333333330003';
              var crustCharacteristic = '13333333-3333-3333-3333-333333330001';
              setTimeout(() => {
                BleManager.startNotification(peripheral.id, service, bakeCharacteristic).then(() => {
                  console.log(' \n\n\n Started notification on ' + peripheral.id);
                  setTimeout(() => {
                    BleManager.write(peripheral.id, service, crustCharacteristic, [0]).then(() => {
                      console.log(' \n\n\n Writed NORMAL crust');
                      BleManager.write(peripheral.id, service, bakeCharacteristic, [1,95]).then(() => {
                        console.log(' \n\n\n Writed 351 temperature, the pizza should be BAKED');
                        //var PizzaBakeResult = {
                        //  HALF_BAKED: 0,
                        //  BAKED:      1,
                        //  CRISPY:     2,
                        //  BURNT:      3,
                        //  ON_FIRE:    4
                        //};
                      });
                    });
                  }, 500);
                }).catch((error) => {
                  console.log(' \n\n\n Notification error', error);
                });
              }, 200);
            });*/
            }, 900);
          })
          .catch(error => {
            console.log(' \n\n\n Connection error', error);
            setLoader(false);

            setTimeout(() => {
              let arr = [];
              arr.push({title: 'CONNECTION ERROR', id: Math.random()});
              setLogs(arr);
              ToastAndroid.show('CONNECTION ERROR', ToastAndroid.SHORT);
            }, 855);
          });
      }
    }
  };

  useEffect(() => {
    setLoader(true);

    console.log('\n\n\n useEffect ');
    BleManager.start({showAlert: false})
      .then(() => {
        setLoader(false);
        setTimeout(() => {
          let arr = [];
          arr.push({title: 'Bluetooth MANAGER START', id: Math.random()});
          setLogs(arr);
          ToastAndroid.show('Bluetooth MANAGER START', ToastAndroid.SHORT);
        }, 855);
        console.log('\n\n\n BleManager.start .then  ');
      })
      .catch(error => {
        setLoader(false);
        setTimeout(() => {
          let arr = [];
          arr.push({title: 'Bluetooth MANAGER ERROR', id: Math.random()});
          setLogs(arr);
          ToastAndroid.show('Bluetooth MANAGER ERROR', ToastAndroid.SHORT);
        }, 855);
        console.log('\n\n\n BleManager.start .catch  ');
      });

    bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      handleDiscoverPeripheral,
    );
    bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
    bleManagerEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      handleDisconnectedPeripheral,
    );
    bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      handleUpdateValueForCharacteristic,
    );

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then(result => {
        if (result) {
          setTimeout(() => {
            let arr = [];
            arr.push({title: 'LOCATION PERMISION GRANTED', id: Math.random()});
            setLogs(arr);
            ToastAndroid.show('LOCATION PERMISION GRANTED', ToastAndroid.SHORT);
          }, 855);

          console.log(' \n\n\n \n\n Permission is OK');
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ).then(result => {
            if (result) {
              setTimeout(() => {
                let arr = [];
                arr.push({
                  title: 'LOCATION PERMISION GRANTED',
                  id: Math.random(),
                });
                setLogs(arr);
                ToastAndroid.show(
                  'LOCATION PERMISION GRANTED',
                  ToastAndroid.SHORT,
                );
              }, 855);
              console.log(' \n\n\n User accept location permission');
            } else {
              setTimeout(() => {
                let arr = [];
                arr.push({
                  title: 'LOCATION PERMISION NOT GRANTED',
                  id: Math.random(),
                });
                setLogs(arr);
                ToastAndroid.show(
                  'LOCATION PERMISION NOT GRANTED',
                  ToastAndroid.SHORT,
                );
              }, 855);
              console.log(' \n\n\n User refuse location permission');
            }
          });
        }
      });
    }

    return () => {
      console.log(' \n\n\n unmount');
      bleManagerEmitter.removeListener(
        'BleManagerDiscoverPeripheral',
        handleDiscoverPeripheral,
      );
      bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan);
      bleManagerEmitter.removeListener(
        'BleManagerDisconnectPeripheral',
        handleDisconnectedPeripheral,
      );
      bleManagerEmitter.removeListener(
        'BleManagerDidUpdateValueForCharacteristic',
        handleUpdateValueForCharacteristic,
      );
    };
  }, []);
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
  const renderItem = item => {
    const color = item.connected ? '#0fa' : '#bbb';
    // console.log('\n\n\n  renderItem == ', item);
    return (
      <>
        <TouchableHighlight
          style={{backgroundColor: 'transparent'}}
          onPress={() => testPeripheral(item)}>
          <View
            style={[
              styles.row,
              {
                backgroundColor: color,
                marginVertical: 10,
                marginHorizontal: 20,
                borderRadius: 7,
                elevation: 5,
              },
            ]}>
            <Text
              style={{
                fontSize: 18,
                textAlign: 'center',
                color: '#333333',
                padding: 5,
                fontWeight: 'bold',
              }}>
              {item.name}
            </Text>
            <Text
              style={{
                fontSize: 14,
                textAlign: 'center',
                color: '#333333',
                padding: 1,
              }}>
              Signal Strength: {item.rssi}
            </Text>
            <Text
              style={{
                fontSize: 16,
                textAlign: 'center',
                color: '#333333',
                padding: 1,
                paddingBottom: 5,
                fontWeight: 'bold',
              }}>
              {item.id}
            </Text>
            {/* <Text
            style={{
              fontSize: 16,
              textAlign: 'center',
              color: '#333333',
              padding: 2,
              paddingBottom: 20,
              fontWeight: 'bold',
            }}>
            {JSON.stringify(item)}
          </Text> */}
          </View>
        </TouchableHighlight>
      </>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={'#fff'} />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          {/* {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
              <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
          )} */}
          <View style={styles.body}>
            <View>
              <TextInput
                //  editable={list?.length > 0 ? true : false}
                value={mac}
                onChangeText={text => {
                  setMac(text);
                }}
                placeholder="If MAC Address is available, Enter it here"
                style={{
                  alignSelf: 'center',
                  marginHorizontal: 20,
                  height: 45,
                  backgroundColor: '#ddd',
                  width: width - 96,
                  borderBottomWidth: 1,
                  borderBottomColor: '#000',
                  marginTop: 40,
                }}
              />
              <TouchableOpacity
                style={{
                  height: 30,
                  width: 30,
                  borderRadius: 20,
                  backgroundColor: '#0ad',
                  position: 'absolute',
                  top: 47,
                  left: 270,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  setMac('');
                }}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 17,
                    color: 'black',
                  }}>
                  X
                </Text>
              </TouchableOpacity>

              <View style={{margin: 50, marginBottom: 2, elevation: 5}}>
                <Button
                  disabled={isScanning || mac.length < 10}
                  title={'Search Device with MAC Address'}
                  onPress={() => startConnect()}
                />
              </View>
            </View>
            <View style={{margin: 50, elevation: 5}}>
              <Button
                disabled={isScanning}
                title={'Scan Bluetooth (' + (isScanning ? 'on' : 'off') + ')'}
                onPress={() => startScan()}
              />
            </View>

            <View style={{margin: 50, marginTop: 10, elevation: 5}}>
              <Button
                title="Retrieve connected devices"
                onPress={() => retrieveConnected()}
              />
            </View>
          </View>
          {isDataRetrieved && (
            <Text
              style={{
                fontSize: 18,
                textAlign: 'center',
                color: '#333333',
                padding: 5,
                fontWeight: 'bold',
                alignSelf: 'center',
              }}>
              RETRIEVED DATA: {JSON.stringify(dataRetrieved)}
            </Text>
          )}

          <FlatList
            data={duplicateData ? duplicateData : list}
            renderItem={({item}) => renderItem(item)}
            keyExtractor={item => item.id}
            ListHeaderComponent={() => {
              return (
                <View>
                  <TextInput
                    editable={list?.length > 0 ? true : false}
                    value={search}
                    onChangeText={text => {
                      searchFunc(text);
                      setSearch(text);
                    }}
                    placeholder="Search MAC Address"
                    style={{
                      alignSelf: 'center',
                      marginHorizontal: 20,
                      height: 45,
                      backgroundColor: '#ddd',
                      width: width - 96,
                      borderBottomWidth: 1,
                      borderBottomColor: '#000',
                    }}
                  />
                  <TouchableOpacity
                    style={{
                      height: 30,
                      width: 30,
                      borderRadius: 20,
                      backgroundColor: '#0ad',
                      position: 'absolute',
                      top: 8,
                      left: 260,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => {
                      setSearch('');
                      searchFunc('');
                    }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontSize: 17,
                        color: 'black',
                      }}>
                      X
                    </Text>
                  </TouchableOpacity>

                  <Text
                    style={{
                      fontSize: 18,
                      textAlign: 'center',
                      color: '#333333',
                      padding: 5,
                      fontWeight: 'bold',
                      alignSelf: 'center',
                    }}>
                    DEVICES
                  </Text>
                </View>
              );
            }}
            ListEmptyComponent={() => (
              <View style={{flex: 1, margin: 20}}>
                <Text
                  style={{
                    textAlign: 'center',

                    fontWeight: 'bold',
                    fontSize: 20,
                  }}>
                  No Devices
                </Text>
              </View>
            )}
          />
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
          {/* {logs &&
            logs.map(item => (
              <View style={{margin: 10, marginTop: 5}}>
                <Text
                  style={{
                    alignSelf: 'center',
                    textAlign: 'center',
                    fontSize: 13,
                    color: '#000',
                  }}>
                  {item.title}
                </Text>
              </View>
            ))} */}
          <FlatList
            data={logs}
            renderItem={({item, index}) => {
              return (
                <View style={{margin: 10, marginTop: 5}}>
                  <Text
                    style={{
                      alignSelf: 'center',
                      textAlign: 'center',
                      fontSize: 13,
                      color: '#000',
                    }}>
                    {item.title}
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
          <Modal visible={loader} transparent={true}>
            <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.2)'}}>
              <ActivityIndicator
                size={'large'}
                style={{marginTop: 300}}
                color={'#0ad'}
              />
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
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
});

export default App;
