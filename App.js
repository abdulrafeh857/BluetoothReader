/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React from 'react';
import {Root, StyleProvider} from 'native-base';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import getTheme from './native-base-theme/components';
import platform from './native-base-theme/variables/platform';
import ConnectionScreen from './src/connection/ConnectionScreen';
import ConnectionScreenFunc from './src/connectionFunctional/ConnectionScreen';
import DeviceListScreen from './src/device-list/DeviceListScreen';
import {Text, TouchableOpacity} from 'react-native';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';

const App = () => {
  const [device, setDevice] = React.useState(undefined);
  const [bluetoothEnabled, setBluetoothEnabled] = React.useState(false);
  const [loader, setLoader] = React.useState(false);

  /**
   * Sets the current device to the application state.  This is super basic
   * and should be updated to allow for things like:
   * - multiple devices
   * - more advanced state management (redux)
   * - etc
   *
   * @param device the BluetoothDevice selected or connected
   */
  const selectDevice = device => {
    console.log(' \n\n\n  App::selectDevice() called with: ', device);
    setDevice(device);
  };

  /**
   * On mount:
   *
   * - setup the connect and disconnect listeners
   * - determine if bluetooth is enabled (may be redundant with listener)
   */
  React.useEffect(() => {
    console.log(
      'App::componentDidMount adding listeners: onBluetoothEnabled and onBluetoothDistabled',
    );
    console.log(
      'App::componentDidMount alternatively could use onStateChanged',
    );
    const enabledSubscription = RNBluetoothClassic.onBluetoothEnabled(event =>
      onStateChanged(event),
    );
    const disabledSubscription = RNBluetoothClassic.onBluetoothDisabled(event =>
      onStateChanged(event),
    );

    checkBluetootEnabled();
    setTimeout(() => {
      acceptConnection();
    }, 2000);
    return () => {
      console.log(
        'App:componentWillUnmount removing subscriptions: enabled and distabled',
      );
      console.log(
        'App:componentWillUnmount alternatively could have used stateChanged',
      );
      enabledSubscription.remove();
      disabledSubscription.remove();
    };
  }, []);
  /**
   * Performs check on bluetooth being enabled.  This removes the `setState()`
   * from `componentDidMount()` and clears up lint issues.
   */
  const checkBluetootEnabled = async () => {
    try {
      console.log(' \n\n\n  App::BLUETOOTH Checking bluetooth status');
      let enabled = await RNBluetoothClassic.isBluetoothEnabled();

      console.log(`App::BLUETOOTH Status: ${enabled}`);
      setBluetoothEnabled(enabled);
      if (!enabled) {
        bluetoothFunc();
      }
    } catch (error) {
      console.log(' \n\n\n  App::BLUETOOTH Status Error: ', error);
      setBluetoothEnabled(false);
    }
  };

  /**
   * Handle state change events.
   *
   * @param stateChangedEvent event sent from Native side during state change
   */

  const bluetoothFunc = async () => {
    var bluetoothPermission = false;

    await BluetoothStateManager.getState().then(async bluetoothState => {
      console.log('\n\n BLUETOOTH     ', bluetoothState);

      setLoader(true);
      if (bluetoothState === 'PoweredOn') {
        setBluetoothEnabled(true);
        bluetoothPermission = true;
        console.log('\n\n BLUETOOTH     ', bluetoothPermission);
        setLoader(false);
      } else if (bluetoothState === 'PoweredOff') {
        await BluetoothStateManager.enable()
          .then(() => {
            setBluetoothEnabled(true);
            bluetoothPermission = true;
            console.log('\n\n BLUETOOTH     ', bluetoothPermission);
            setLoader(false);
          })
          .catch(error => {
            setBluetoothEnabled(false);
            console.log('\n\n BLUETOOTH  CATCH   ', error);
            setLoader(false);
          });
      } else {
        setBluetoothEnabled(false);
        console.log('\n\n    BLUETOOTH IS ======', bluetoothState);
        bluetoothPermission = false;
        setLoader(false);
      }
    });
  };

  const onStateChanged = stateChangedEvent => {
    console.log(
      'App::onStateChanged event used for onBluetoothEnabled and onBluetoothDisabled',
    );
    setBluetoothEnabled(stateChangedEvent.enabled);
    setDevice(stateChangedEvent.enabled ? device : undefined);
  };
  const acceptConnection = async () => {
    if (bluetoothEnabled) {
      console.log(' \n\n\n  \n\n ACCEPT CONNECTIONS');
      let connection = await RNBluetoothClassic.accept({
        delimiter: '\r',
      });
      console.log(
        ' \n\n\n  \n\n\n CONNECTION RNBluetoothModule.accept ',
        connection,
      );
    } else {
      console.log(' \n\n\n  \n\n BLUEOOTH FALSE NO ACCEPT CONNECTIONS');
    }
  };
  return (
    <StyleProvider style={getTheme(platform)}>
      <Root>
        {!device ? (
          <>
            {/* <TouchableOpacity
              style={{
                alignSelf: 'center',
                marginTop: 10,
                backgroundColor: '#00f',
                padding: 5,
                borderRadius: 5,
                width: '40%',
                alignItems: 'center',
                justifyContent: 'center',
                height: 40,
                elevation: 8,
              }}
              //    disabled={!bluetoothAvailable || !bluetoothEnabled || discovering}
              onPress={async () => {
                console.log(' \n\n\n  \n\n ACCEPT CONNECTIONS');
                let connection = await RNBluetoothClassic.accept({
                  delimiter: '\r',
                });
                console.log(
                  '\n\n\n CONNECTION RNBluetoothModule.accept ',
                  connection,
                );
              }}>
              <Text
                style={{
                  alignSelf: 'center',
                  textAlign: 'center',
                  color: '#fff',
                }}>
                Accept Connections
              </Text>
            </TouchableOpacity> */}
            <DeviceListScreen
              bluetoothEnabled={bluetoothEnabled}
              selectDevice={selectDevice}
            />
          </>
        ) : (
          <ConnectionScreenFunc
            device={device}
            onBack={() => setDevice(undefined)}
          />
        )}
      </Root>
    </StyleProvider>
  );
};
/*
 if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
          if (result) {
            console.log("Permission is OK");
          } else {
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
              if (result) {
                console.log("User accept");
              } else {
                console.log("User refuse");
              }
            }
*/
export default App;
