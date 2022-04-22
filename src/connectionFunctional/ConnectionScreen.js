/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import RNBluetoothClassic from "react-native-bluetooth-classic";
import {
  Container,
  Text,
  Header,
  Left,
  Button,
  Icon,
  Body,
  Title,
  Subtitle,
  Right,
} from "native-base";
import {
  FlatList,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import moment from "moment";
import { Buffer } from "buffer";
import sendDataApi from "../Api/sendDataApi";
/**
 * Manages a selected device connection.  The selected Device should
 * be provided as {@code props.device}, the device will be connected
 * to and processed as such.
 *
 * @author rafeh
 */
const ConnectionScreen = (props) => {
  const [text, setText] = useState(undefined);
  const [receieveText, setReceieveText] = useState();
  const [data, setData] = useState([]);
  const [polling, setPolling] = useState(false);
  const [connection, setConnection] = useState(false);
  const [connectionOptions, setConnectionOptions] = useState({
    DELIMITER: "9",
  });
  var readInterval;
  var readSubscription;
  /**
   * Attempts to connect to the provided device.  Once a connection is
   * made the screen will either start listening or polling for
   * data based on the configuration.
   */
  /**
   * Removes the current subscriptions and disconnects the specified
   * device.  It could be possible to maintain the connection across
   * the application, but for now the connection is within the context
   * of these screen.
   */
  useEffect(() => {
    setTimeout(() => connect(), 0);

    return () => {
      if (connection) {
        try {
          // await props.device.disconnect();
          props.device.disconnect();
        } catch (error) {
          console.log("\n\n Unable to disconnect from device");
          // Unable to disconnect from device
        }
      }

      uninitializeRead();
    };
  }, [connection, props.device]);

  const connect = async () => {
    try {
      let connected = await props.device.isConnected();
      if (!connected) {
        addData({
          data: `Attempting connection to ${props.device.address}`,
          timestamp: new Date(),
          type: "error",
        });

        console.log("\n\n\n connectionOptions = ", connectionOptions);
        connected = await props.device.connect();

        addData({
          data: "Connection successful",
          timestamp: new Date(),
          type: "info",
        });
      } else {
        addData({
          data: `Connected to ${props.device.address}`,
          timestamp: new Date(),
          type: "error",
        });
      }
      setConnection(connected);
      initializeRead();
    } catch (error) {
      addData({
        data: `Connection failed: ${error.message}`,
        timestamp: new Date(),
        type: "error",
      });
    }
  };
  const disconnect = async (disconnected) => {
    try {
      if (!disconnected) {
        disconnected = await props.device.disconnect();
      }

      addData({
        data: "Disconnected",
        timestamp: new Date(),
        type: "info",
      });

      setConnection(!disconnected);
    } catch (error) {
      addData({
        data: `Disconnect failed: ${error.message}`,
        timestamp: new Date(),
        type: "error",
      });
    }

    // Clear the reads, so that they don't get duplicated
    uninitializeRead();
  };
  const initializeRead = async () => {
    var disconnectSubscription = RNBluetoothClassic.onDeviceDisconnected(() =>
      disconnect(true)
    );

    if (polling) {
      readInterval = setInterval(() => performRead(), 5000);
    } else {
      readSubscription = props.device.onDataReceived((data) => {
        onReceivedData(data);
        console.log("\n\n onReceivedData data", data);
      });
    }
  };

  /**
   * Clear the reading functionality.
   */
  const uninitializeRead = async () => {
    if (readInterval) {
      clearInterval(readInterval);
    }
    if (readSubscription) {
      readSubscription.remove();
    }
  };

  const performRead = async () => {
    try {
      console.log("Polling for available messages");
      let available = await props.device.available();
      console.log(`There is data available [${available}], attempting read`);

      if (available > 0) {
        for (let i = 0; i < available; i++) {
          console.log(`reading ${i}th time`);
          let data = await props.device.read();

          console.log(`Read data ${data}`);
          console.log(data);
          onReceivedData({ data });
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  /**
   * Handles the ReadEvent by adding a timestamp and applying it to
   * list of received data.
   *
   * @param {ReadEvent} event
   */
  const onReceivedData = async (event) => {
    console.log("\n\n onReceivedData == ", event);

    // call API here
    sendDataApi(event);
    event.timestamp = new Date();
    addData({
      ...event,
      timestamp: new Date(),
      type: "receive",
    });
  };

  const addData = async (message) => {
    setReceieveText(message);
    // console.log("\n\n\n  addData message === ", message);
    // console.log("\n\n\n  addData  DATA === ", data);
    // let arr = [...data];
    // arr.push(message);
    // setData(arr);
    console.log("\n\n\n  addData ARR === ", message);
  };

  /**
   * Attempts to send data to the connected Device.  The input text is
   * padded with a NEWLINE (which is required for most commands)
   */
  const sendData = async () => {
    try {
      console.log(`Attempting to send data ${text}`);
      console.log(`To Device = ${props.device.name}`);
      let message = text + "\r";
      await RNBluetoothClassic.writeToDevice(props.device.address, message);

      addData({
        timestamp: new Date(),
        data: text,
        type: "sent",
      });

      setText(undefined);
    } catch (error) {
      console.log("\n\n\n sendData error ", error);
    }
  };

  const toggleConnection = async () => {
    if (connection) {
      disconnect();
    } else {
      connect();
    }
  };
  let toggleIcon = connection ? "radio-button-on" : "radio-button-off";

  return (
    <Container>
      <Header iosBarStyle="light-content">
        <Left>
          <Button transparent onPress={props.onBack}>
            <Icon type="Ionicons" name="arrow-back" />
          </Button>
        </Left>
        <Body>
          <Title>{props.device.name}</Title>
          <Subtitle>{props.device.address}</Subtitle>
        </Body>
        <Right>
          <Button transparent onPress={() => toggleConnection()}>
            <Icon type="Ionicons" name={toggleIcon} />
          </Button>
        </Right>
      </Header>
      <View style={styles.connectionScreenWrapper}>
        <Text>{JSON.stringify(receieveText)}</Text>
        <View style={styles.connectionScreenOutput}></View>
        {/* <FlatList
          style={styles.connectionScreenOutput}
          contentContainerStyle={{ justifyContent: "flex-end" }}
          inverted
          //    ref="scannedDataList"
          data={data}
          keyExtractor={(item) => item.timestamp.toISOString()}
          renderItem={({ item }) => (
            <View
              id={item.timestamp.toISOString()}
              flexDirection={"row"}
              justifyContent={"flex-start"}
            >
              <Text>
                {moment(item.timestamp).format("DD-MM-YYYY HH:MM:SS")}
              </Text>
              <Text>{item.type === "sent" ? " < " : " > "}</Text>
              <Text flexShrink={1}>{item.data}</Text>
            </View>
          )}
        /> */}
        <InputArea
          text={text}
          onChangeText={(text) => setText(text)}
          onSend={() => sendData()}
          disabled={!connection}
        />
      </View>
    </Container>
  );
};
const InputArea = ({ text, onChangeText, onSend, disabled }) => {
  let style = disabled ? styles.inputArea : styles.inputAreaConnected;
  return (
    <View style={style}>
      <TextInput
        style={styles.inputAreaTextInput}
        placeholder={"Command/Text"}
        value={text}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={onSend}
        returnKeyType="send"
        disabled={disabled}
      />
      <TouchableOpacity
        style={styles.inputAreaSendButton}
        onPress={onSend}
        disabled={disabled}
      >
        <Text>Send</Text>
      </TouchableOpacity>
    </View>
  );
};
export default ConnectionScreen;
/**
 * TextInput and Button for sending
 */
const styles = StyleSheet.create({
  connectionScreenWrapper: {
    flex: 1,
  },
  connectionScreenOutput: {
    flex: 1,
    paddingHorizontal: 8,
  },
  inputArea: {
    flexDirection: "row",
    alignContent: "stretch",
    backgroundColor: "#ccc",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  inputAreaConnected: {
    flexDirection: "row",
    alignContent: "stretch",
    backgroundColor: "#90EE90",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  inputAreaTextInput: {
    flex: 1,
    height: 40,
  },
  inputAreaSendButton: {
    justifyContent: "center",
    flexShrink: 1,
  },
});
