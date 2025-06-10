import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import Socket from "../utils/socket"; // Back to enhanced socket with tilt
import * as ScreenOrientation from "expo-screen-orientation";
import {
  GestureHandlerRootView,
  LongPressGestureHandler,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import hapticFeedback from "../utils/hapticFeedback";

const GameController = ({ route }) => {
  const address = route.params;
  const [socket, setSocket] = useState(null);
  const [pressedButtons, setPressedButtons] = useState(new Set());
  const [tiltEnabled, setTiltEnabled] = useState(false); // OFF by default
  const [hapticsEnabled, setHapticsEnabled] = useState(true); // ON by default
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [rightJoystickActive, setRightJoystickActive] = useState(false);
  const [joystickCenter, setJoystickCenter] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Lock the orientation to landscape mode
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    // Unlock the orientation when the component unmounts
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);
  useEffect(() => {
    let currentSocket = null;

    try {
      setConnectionStatus("Connecting...");
      currentSocket = Socket(address);

      // Override socket event handlers to update status
      const originalOnOpen = currentSocket.onopen;
      const originalOnClose = currentSocket.onclose;
      const originalOnError = currentSocket.onerror;

      currentSocket.onopen = (event) => {
        setConnectionStatus("Connected");
        if (originalOnOpen) originalOnOpen(event);
      };

      currentSocket.onclose = (event) => {
        setConnectionStatus("Disconnected");
        if (originalOnClose) originalOnClose(event);
      };

      currentSocket.onerror = (event) => {
        setConnectionStatus("Error");
        if (originalOnError) originalOnError(event);
      };

      setSocket(currentSocket);
    } catch (error) {
      console.error("Socket connection failed:", error);
      setConnectionStatus("Failed");
      alert("Socket connection failed!");
    }

    return () => {
      if (currentSocket) {
        // Use custom cleanup method if available
        if (currentSocket.cleanup) {
          currentSocket.cleanup();
        }

        // Close the socket
        try {
          currentSocket.close();
        } catch (error) {
          console.error("Error closing socket:", error);
        }
      }
      setConnectionStatus("Disconnected");
    };
  }, [address]);
  // Handle tilt enable/disable
  useEffect(() => {
    if (socket && socket.setTiltEnabled) {
      socket.setTiltEnabled(tiltEnabled);
    }
  }, [tiltEnabled, socket]);

  // Handle haptics enable/disable
  useEffect(() => {
    if (socket && socket.setHapticsEnabled) {
      socket.setHapticsEnabled(hapticsEnabled);
    }
    hapticFeedback.setEnabled(hapticsEnabled);
  }, [hapticsEnabled, socket]);
  const handlePressIn = (button) => {
    console.log("handlePressIn", button);

    // Mild haptic feedback for button press
    hapticFeedback.buttonPress();

    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify({ type: "pressIn", value: button }));
      } catch (error) {
        console.error("Failed to send pressIn:", error);
      }
    }
  };
  const handleStateChange = (event, button) => {
    console.log(event.nativeEvent.state);
    if (event.nativeEvent.state === State.BEGAN) {
      handlePressIn(button);
    } else if (
      event.nativeEvent.state === State.END ||
      event.nativeEvent.state === State.CANCELLED
    ) {
      handlePressOut(button);
    }
  };
  const handlePressOut = (button) => {
    console.log("handlePressOut", button);
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify({ type: "pressOut", value: button }));
      } catch (error) {
        console.error("Failed to send pressOut:", error);
      }
    }
  }; // Handle right joystick movement with continuous updates
  const sendJoystickData = useCallback(
    (x, y) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        console.log(`Joystick movement: x=${x.toFixed(3)}, y=${y.toFixed(3)}`);
        try {
          socket.send(
            JSON.stringify({
              type: "rightJoystick",
              x: parseFloat(x.toFixed(3)),
              y: parseFloat(y.toFixed(3)),
            })
          );
        } catch (error) {
          console.error("Failed to send rightJoystick data:", error);
        }
      }
    },
    [socket]
  ); // Handle right joystick state changes
  const handleRightJoystickStateChange = (event) => {
    const { state } = event.nativeEvent;

    console.log(`Gesture state changed: ${state}`);

    if (state === State.BEGAN) {
      console.log("Right joystick activated");
      setRightJoystickActive(true);
      sendJoystickData(0, 0); // Send initial center position
    } else if (
      state === State.END ||
      state === State.CANCELLED ||
      state === State.FAILED
    ) {
      console.log("Right joystick deactivated - returning to center");
      setRightJoystickActive(false);
      sendJoystickData(0, 0); // Send neutral position when gesture ends
    }
  };

  // Handle continuous gesture movement
  const handleRightJoystickGesture = (event) => {
    const { translationX, translationY } = event.nativeEvent;

    console.log(
      `Gesture movement - translationX: ${translationX}, translationY: ${translationY}`
    );

    // Calculate joystick values (-1 to 1) based on translation
    const maxRange = 70; // pixels - distance from center for full joystick range

    const distance = Math.sqrt(
      translationX * translationX + translationY * translationY
    );

    // Calculate normalized values (-1 to 1)
    let x = translationX / maxRange;
    let y = -translationY / maxRange; // Negative because screen Y is inverted

    // Limit to circle (prevent values > 1)
    if (distance > maxRange) {
      const angle = Math.atan2(translationY, translationX);
      x = Math.cos(angle);
      y = -Math.sin(angle); // Negative because screen Y is inverted
    }

    // Clamp values to ensure they're within -1 to 1
    x = Math.max(-1, Math.min(1, x));
    y = Math.max(-1, Math.min(1, y)); // Apply deadzone to prevent drift near center
    const deadzone = 0.1;
    const distanceNormalized = distance / maxRange;
    if (distanceNormalized < deadzone) {
      x = 0;
      y = 0;
    }

    console.log(
      `Calculated joystick values: x=${x.toFixed(3)}, y=${y.toFixed(
        3
      )}, distance=${distance.toFixed(1)}`
    );

    // Send the joystick values continuously during drag
    sendJoystickData(x, y);
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
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>Status: {connectionStatus}</Text>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            { backgroundColor: tiltEnabled ? "#4CAF50" : "#f44336" },
          ]}
          onPress={() => setTiltEnabled(!tiltEnabled)}
        >
          <Text style={styles.toggleText}>
            Tilt: {tiltEnabled ? "ON" : "OFF"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            { backgroundColor: hapticsEnabled ? "#4CAF50" : "#f44336" },
          ]}
          onPress={() => setHapticsEnabled(!hapticsEnabled)}
        >
          <Text style={styles.toggleText}>
            Haptic: {hapticsEnabled ? "ON" : "OFF"}
          </Text>
        </TouchableOpacity>
        {rightJoystickActive && (
          <View style={styles.joystickIndicator}>
            <Text style={styles.indicatorText}>R-Stick</Text>
          </View>
        )}
      </View>
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
          <PanGestureHandler
            onGestureEvent={handleRightJoystickGesture}
            onHandlerStateChange={handleRightJoystickStateChange}
            minPointers={1}
            maxPointers={1}
            avgTouches={false}
            shouldCancelWhenOutside={false}
            failOffsetX={[-1000, 1000]}
            failOffsetY={[-1000, 1000]}
            activeOffsetX={[-5, 5]}
            activeOffsetY={[-5, 5]}
          >
            <View style={styles.rightJoystickContainer}>
              <Button label="Y" value="y" style={styles.dpadVertical} />
              <View style={styles.dpadMiddle}>
                <Button label="X" value="x" style={styles.dpadHorizontal} />
                <View
                  style={[
                    styles.dpadCenter,
                    rightJoystickActive && styles.activeJoystickCenter,
                    rightJoystickActive && styles.joystickKnob,
                  ]}
                />
                <Button label="B" value="b" style={styles.dpadHorizontal} />
              </View>
              <Button label="A" value="a" style={styles.dpadVertical} />
            </View>
          </PanGestureHandler>
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
  statusBar: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    zIndex: 1000,
    gap: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  toggleButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  toggleText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  topButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 40,
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
    borderRadius: 25,
    backgroundColor: "#ccc",
    borderWidth: 2,
    borderColor: "#999",
  },
  activeJoystickCenter: {
    backgroundColor: "#4CAF50",
    borderColor: "#2E7D32",
    opacity: 0.9,
  },
  joystickKnob: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rightJoystickContainer: {
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  joystickIndicator: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginLeft: 5,
  },
  indicatorText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
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
