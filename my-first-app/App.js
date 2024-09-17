import GameController from "./components/gameController";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EnterAddress from "./components/enterAddress";

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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
