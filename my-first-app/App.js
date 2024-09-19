import GameController from "./components/gameController";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EnterAddress from "./components/enterAddress";
import Gamepad from "./components/gamepad";
import Keypad from "./components/keypad";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="EnterAddress">
        <Stack.Screen name="EnterAddress" component={EnterAddress} />
        <Stack.Screen
          name="GameController"
          component={GameController}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Gamepad"
          component={Gamepad}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Keypad"
          component={Keypad}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
