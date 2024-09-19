import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import Socket from "../utils/socket";
import * as ScreenOrientation from "expo-screen-orientation";
import {
  GestureHandlerRootView,
  LongPressGestureHandler,
  State,
} from "react-native-gesture-handler";

const GameController = ({ route }) => {
  const address = route.params;
  const [socket, setSocket] = useState(null);
  const [pressedButtons, setPressedButtons] = useState(new Set());

  useEffect(() => {
    // Lock the orientation to portrait mode
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    // Unlock the orientation when the component unmounts
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  useEffect(() => {
    try {
      setSocket(Socket(address));
    }catch (error) {
      console.error('Socket connection failed:', error);
      alert('Socket connection failed!');
    }
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const handlePressIn = (button) => {
    console.log("handlePressIn", button);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "pressIn", value: button }));
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
      socket.send(JSON.stringify({ type: "pressOut", value: button }));
    }
  };

  const Button = ({ label, value, style }) => (
    <LongPressGestureHandler
      onHandlerStateChange={(event) => handleStateChange(event, value)}
      minDurationMs={0}
    >
      <View
        style={[
          styles.button,
          style,
          pressedButtons.has(value) && styles.pressedButton,
        ]}
      >
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
        <View style={styles.mButtons}>
          <View style={styles.mMiddle}>
            <Button label="K" value="back" style={styles.mHorizontal} />
            <View style={styles.mCenter} />
            <Button label="S" value="start" style={styles.mHorizontal} />
          </View>
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
    width: "90%",
    marginBottom: 40,
    marginTop: 30,
  },
  shoulderButton: {
    width: 120,
    height: 60,
  },
  mainControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "96%",
  },
  dpad: {
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  dpadMiddle: {
    flexDirection: "row",
    alignItems: "center",
  },
  mMiddle: {
    flexDirection: "row",
    alignItems: "center",
  },
  dpadCenter: {
    width: 50,
    height: 50,

    backgroundColor: "#ccc",
  },
  mCenter: {
    width: 10,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ccc",
  },
  dpadVertical: {
    width: 60,
    height: 60,
  },
  dpadHorizontal: {
    width: 60,
    height: 60,
  },
  mHorizontal: {
    width: 60,
    height: 60,
  },
  actionButtons: {
    width: 180,
    height: 180,
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
    width: 70,
    height: 50,
  },
  actionBottom: {
    marginTop: 10,
  },
  button: {
    backgroundColor: "#335c67",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    margin: 9,
  },
  mButtons: {
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default GameController;
