import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import {
  GestureHandlerRootView,
  LongPressGestureHandler,
  State,
} from "react-native-gesture-handler";
import TiltDetection from "../utils/tiltDetection";

const Gamepad = ({ route }) => {
  const socket = route.params;
  console.log("hi", socket);
  useEffect(() => {
    const tilt = TiltDetection(socket);
    return tilt;
  }, []);

  const handlePressIn = (button) => {
    console.log("handlePressIn", button);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({ from: "gamepad", type: "pressIn", value: button })
      );
    }
  };

  const handleStateChange = (event, button) => {
    if (event.nativeEvent.state === State.BEGAN) {
      handlePressIn(button);
    } else if (event.nativeEvent.state === State.END) {
      handlePressOut(button);
    }
  };

  const handlePressOut = (button) => {
    console.log("handlePressOut", button);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({ from: "gamepad", type: "pressOut", value: button })
      );
    }
  };

  const Button = ({ label, value, style }) => (
    <LongPressGestureHandler
      onHandlerStateChange={(event) => handleStateChange(event, value)}
      minDurationMs={0}
    >
      <View style={[styles.button, style]}>
        <Text style={styles.buttonText}>{label}</Text>
      </View>
    </LongPressGestureHandler>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.topButtons}>
        <Button label="L1" value="l1" style={styles.shoulderButton} />
        <Button label="R1" value="r1" style={styles.shoulderButton} />
      </View>
      <View style={styles.mainControls}>
        <View style={styles.dpad}>
          <Button label="↑" value="up" style={styles.dpadVertical} />
          <View style={styles.dpadMiddle}>
            <Button label="←" value="left" style={styles.dpadHorizontal} />
            <View style={styles.dpadCenter} />
            <Button label="→" value="right" style={styles.dpadHorizontal} />
          </View>
          <Button label="↓" value="down" style={styles.dpadVertical} />
        </View>
        <View style={styles.actionButtons}>
          <Button label="Y" value="y" style={styles.dpadVertical} />
          <View style={styles.dpadMiddle}>
            <Button label="X" value="x" style={styles.dpadHorizontal} />
            <View style={styles.dpadCenter} />
            <Button label="B" value="b" style={styles.dpadHorizontal} />
          </View>
          <Button label="A" value="a" style={styles.dpadVertical} />
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  topButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "97%",
    marginBottom: 40,
  },
  shoulderButton: {
    width: 120,
    height: 50,
    marginTop: 30,
  },
  mainControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  dpad: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  dpadMiddle: {
    flexDirection: "row",
    alignItems: "center",
  },
  dpadCenter: {
    width: 50,
    height: 50,
    backgroundColor: "#ccc",
  },
  dpadVertical: {
    width: 50,
    height: 50,
  },
  dpadHorizontal: {
    width: 50,
    height: 50,
  },
  actionButtons: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTop: {
    marginBottom: 20,
  },
  actionMiddle: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  actionSide: {
    width: 50,
    height: 50,
  },
  actionBottom: {
    marginTop: 10,
  },
  button: {
    backgroundColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Gamepad;
