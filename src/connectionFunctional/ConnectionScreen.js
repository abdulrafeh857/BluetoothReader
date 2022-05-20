/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import RNBluetoothClassic, {
  BluetoothEventType,
} from "react-native-bluetooth-classic";
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
  Toast,
} from "native-base";
import {
  FlatList,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import moment from "moment";
import { Buffer } from "buffer";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import Modal from "react-native-modal";
/**
 * Manages a selected device connection.  The selected Device should
 * be provided as {@code props.device}, the device will be connected
 * to and processed as such.
 *
 * @author rafeh
 */
const ConnectionScreen = (props) => {
  const [text, setText] = useState("");
  const [binText, setBinText] = useState("");
  const [receieveText, setReceieveText] = useState();
  const [apiText, setapiText] = useState();
  const [data, setData] = useState([]);
  const [dataBuffer, setDataBuffer] = useState();
  const [polling, setPolling] = useState(false);
  const [connection, setConnection] = useState(false);
  const [loader, setLoader] = useState(false);
  const [totalSum, setTotalSum] = useState(0);
  const [fareSum, setFareSum] = useState(0);
  const [extraSum, setExtraSum] = useState(0);
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

  const sendDataApi = async (total) => {
    setLoader(true);
    console.log("\n\n\n sendDataApi TOTAL === ", total);

    var myHeaders = new Headers();
    // myHeaders.append(
    //   "Authorization",
    //   "token e328ac999552f5697b2cdbc618b479cad59854c7f4cf7f57d681aeb357f05cb7"
    // );
    myHeaders.append("tenant", "4130a539143c4224b78cd6b0a436759a");
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
      amount: total,
      description: "BLACK CAB METER READING",
      taxi_data: {
        ref_id: "123456789",
        reg_number: "ABC 123",
      },
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    console.log("\n\n\n requestOptions === ", requestOptions);
    console.log("\n\n\n RAW === ", raw);

    fetch(
      "https://iclerk-backend-dev.herokuapp.com/paylink/api/public/paylink/",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        console.log("\n\n\n RESPONSE FROM API === ", result);
        setapiText(result);
        setLoader(false);
        Toast.show({
          text: "API Successfull",
          duration: 3000,
        });
      })
      .catch((error) => {
        console.log("\n\n\n RES API error === ", error);
        // setapiText(result);
        setLoader(false);

        Toast.show({
          text: "Error in API",
          duration: 3000,
        });
      });
  };
  const connect = async () => {
    setLoader(true);

    try {
      let connected = await props.device.isConnected();
      if (!connected) {
        setLoader(true);

        addData({
          data: `Attempting connection to ${props.device.address}`,
          timestamp: new Date(),
          type: "error",
        });

        connected = await props.device.connect({ delimiter: "" });

        addData({
          data: "Connection successful",
          timestamp: new Date(),
          type: "info",
        });
        setLoader(false);
      } else {
        addData({
          data: `Connected to ${props.device.address}`,
          timestamp: new Date(),
          type: "error",
        });
        setLoader(false);
      }
      setConnection(connected);
      initializeRead();
    } catch (error) {
      addData({
        data: `Connection failed: ${error.message}`,
        timestamp: new Date(),
        type: "error",
      });
      setLoader(false);
    }
  };
  const disconnect = async (disconnected) => {
    setLoader(true);
    try {
      if (!disconnected) {
        disconnected = await props.device.disconnect();
        setLoader(false);
      }

      addData({
        data: "Disconnected",
        timestamp: new Date(),
        type: "info",
      });

      setConnection(!disconnected);
      setLoader(false);
    } catch (error) {
      addData({
        data: `Disconnect failed: ${error.message}`,
        timestamp: new Date(),
        type: "error",
      });
      setLoader(false);
    }

    // Clear the reads, so that they don't get duplicated
    uninitializeRead();
  };
  const initializeRead = async () => {
    var disconnectSubscription = RNBluetoothClassic.onDeviceDisconnected(() =>
      disconnect(true)
    );
    await RNBluetoothClassic.availableFromDevice(props.device.address).then(
      (data) => {
        console.log(
          "\n\n\n availableFromDevice ",
          props.device.address,
          " is === ",
          data
        );
      }
    );
    if (polling) {
      readInterval = setInterval(() => performRead(), 5000);
    } else {
      readSubscription = props.device.onDataReceived((data) => {
        onReceivedData(data);
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

          console.log(`\n\n\n  Read data ${data}`);
          console.log("\n\n\n performRead JSON ===   ", JSON.stringify(data));
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

    caluclateFare(event.data);

    event.timestamp = new Date();
    addData({
      ...event,
      timestamp: new Date(),
      type: "receive",
    });
  };

  const addData = async (message) => {
    setReceieveText(message);

    // console.log("\n\n\n  addData ARR === ", message);
  };

  const sendDataByte = async () => {
    try {
      console.log(`To Device = ${props.device.name}`);
      let data1 = Buffer.alloc(1, 0x07);
      await props.device.write(data1);
      addData({
        timestamp: new Date(),
        data: `Byte array: ${data1.toString()}`,
        type: "sent",
      });

      console.log("\n\n\n data BUFFER by === ", data1);
      console.log("\n\n\n data BUFFER string by === ", JSON.stringify(data1));

      setDataBuffer(data1);
    } catch (error) {
      console.log("\n\n\n sendDataBYTE error ", error);
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
  let fareTenTousands = 0;
  let fareThousands = 0;
  let fareHundreds = 0;
  let fareTens = 0;
  let fareOnes = 0;

  let extraThousands = 0;
  let extraHundreds = 0;
  let extraTens = 0;
  let extraOnes = 0;

  let checkSum = 0;

  let fare = 0;
  let extra = 0;
  let total = 0;

  const caluclateFare = async (data) => {
    console.log("\n\n\n caluclateFare data ", data);
    // console.log(data.charAt(1));
    // let fareCode = data.charAt(1);

    fareTenTousands = data.charAt(1);
    fareThousands = data.charAt(3);
    fareHundreds = data.charAt(5);
    fareTens = data.charAt(7);
    fareOnes = data.charAt(9);

    extraThousands = data.charAt(11);
    extraHundreds = data.charAt(13);
    extraTens = data.charAt(15);
    extraOnes = data.charAt(17);

    checkSum = data.charAt(19);

    // console.log("\n\n\n fareTenTousands ", fareTenTousands);
    // console.log("\n\n\n fareThousands ", fareThousands);
    // console.log("\n\n\n fareHundreds ", fareHundreds);
    // console.log("\n\n\n fareTens ", fareTens);
    // console.log("\n\n\n fareOnes ", fareOnes);
    // console.log("\n\n\n extraThousands ", extraThousands);
    // console.log("\n\n\n extraHundreds ", extraHundreds);
    // console.log("\n\n\n extraTens ", extraTens);
    // console.log("\n\n\n extraOnes ", extraOnes);
    // console.log("\n\n\n checkSum ", checkSum);

    fare =
      (fareTenTousands * 10000) / 100 +
      (fareThousands * 1000) / 100 +
      (fareHundreds * 100) / 100 +
      (fareTens * 10) / 100 +
      (fareOnes * 1) / 100;

    extra =
      (extraThousands * 1000) / 100 +
      (extraHundreds * 100) / 100 +
      (extraTens * 10) / 100 +
      (extraOnes * 1) / 100;
    total = fare + extra;

    setTotalSum(total);
    setFareSum(fare);
    setExtraSum(extra);
    // call API here
    sendDataApi(total);
    console.log("\n\n\n fare ", fare);
    console.log("\n\n\n extra ", extra);
    console.log("\n\n\n total ", total);

    console.log("\n\n\n fare ", typeof fare);
    console.log("\n\n\n extra ", typeof extra);
    console.log("\n\n\n total ", typeof total);
  };
  return (
    <Container>
      <Modal
        isVisible={loader}
        animationInTiming={1}
        animationOutTiming={1}
        style={{
          width: responsiveWidth(150),
          marginLeft: responsiveWidth(-22),
        }}
      >
        <View
          style={{
            // flex: 1,
            height: responsiveHeight(120),
            // width: responsiveWidth(100),
            backgroundColor: "rgba(0,0,0,0.1)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size={"large"} color={"#33f"}></ActivityIndicator>
        </View>
      </Modal>

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

      <View style={styles.connectionScreen}>
        <Text>{`\n\n` + `JSON = ` + JSON.stringify(receieveText)}</Text>
        <Text style={{ fontWeight: "bold" }}>
          {receieveText && receieveText.data
            ? `\n\n` + `DATA = ` + JSON.stringify(receieveText.data)
            : `\n\n` + `DATA = ` + `No Data.`}
        </Text>
        <Text style={{ fontWeight: "bold" }}>
          {`FARE = ` + fareSum}
          {/* {fare != 0
            ? `\n\n` + `FARE = ` + fare
            : `\n\n` + `FARE = ` + `No Fare.`} */}
        </Text>

        <Text style={{ fontWeight: "bold" }}>
          {`EXTRA = ` + extraSum}
          {/* {extra != 0
            ? `\n\n` + `EXTRA = ` + extra
            : `\n\n` + `EXTRA = ` + `No Extra.`} */}
        </Text>
        <Text style={{ fontWeight: "bold" }}>
          {`TOTAL = ` + totalSum}
          {/* {total != 0
            ? `\n\n` + `TOTAL = ` + total
            : `\n\n` + `TOTAL = ` + `No Total.`} */}
        </Text>

        {!apiText || typeof apiText === "undefined" || !apiText.message ? (
          <Text>{`\n\n` + `API RESPONSE = NO RESPONSE`}</Text>
        ) : (
          <Text>{`\n\n` + `API RESPONSE = ` + apiText.message}</Text>
        )}
      </View>
      <View style={styles.connectionScreenOutput}></View>

      <View
        style={{ flexDirection: "row", justifyContent: "space-around" }}
      ></View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginVertical: 10,
        }}
      >
        <Button
          // transparent
          style={{
            width: 160,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            elevation: 6,
          }}
          onPress={() => {
            // if (text && text.length) {
            sendDataByte();
            // } else {
            //   alert("Please enter text to send");
            // }
          }}
        >
          <Text>REQUEST FARE</Text>
        </Button>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginVertical: 10,
        }}
      ></View>
    </Container>
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
  connectionScreen: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});
