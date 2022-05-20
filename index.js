/**
 * @format
 */

import { AppRegistry, LogBox } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";

LogBox.ignoreLogs(["Require cycle:"]);
AppRegistry.registerComponent(appName, () => App);



//


//

//    "react-native-bluetooth-classic": "^1.60.0-rc.17",
