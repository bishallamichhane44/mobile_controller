import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  GestureHandlerRootView,
  LongPressGestureHandler,
  State,
} from "react-native-gesture-handler";

const LongPressExample = () => {
  const handleLongPress = (event) => {
    if (event.nativeEvent.state === State.BEGAN) {
      console.log("Long Press started");
    }
  };

  const handlePressRelease = (event) => {
    if (event.nativeEvent.state === State.END) {
      console.log("Long Press released");
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <LongPressGestureHandler
        onHandlerStateChange={handleLongPress}
        onEnded={handlePressRelease}
        minDurationMs={1} // Adjust the time for long press if needed
      >
        <View style={styles.button}>
          <Text>Long Press Button</Text>
        </View>
      </LongPressGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#ddd",
    padding: 20,
    margin: 10,
    borderRadius: 5,
  },
});

export default LongPressExample;
