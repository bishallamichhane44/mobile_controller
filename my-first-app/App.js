import { useEffect, useState } from "react";
import io from "socket.io-client";

import GameController from "./components/gameController";
import TiltDetection from "./utils/tiltDetection";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EnterAddress from "./components/enterAddress";

const Stack = createNativeStackNavigator();

const App = () => {
  // const [socket, setSocket] = useState(null);

  // useEffect(() => {
  //   const newSocket = io("http://192.168.43.162:3000");
  //   newSocket.on("connect", () => {
  //     TiltDetection(newSocket);
  //   });
  //   setSocket(newSocket);
  //   return () => newSocket.close();
  // }, []);

  return (
    // {/* <Mouse socket={socket} /> */}
    // <GameController socket={socket} />
    <NavigationContainer>
      <Stack.Navigator initialRouteName="EnterAddress">
        <Stack.Screen name="EnterAddress" component={EnterAddress} />
        <Stack.Screen name="GameController" component={GameController} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
