import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Button, TouchableOpacity } from "react-native";
import io from "socket.io-client";
import { Accelerometer } from "expo-sensors";

const App = () => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [tiltY, setTiltY] = useState(0); // Tilt data along Y-axis

  useEffect(() => {
    const newSocket = io("https://33e7-103-156-26-247.ngrok-free.app/");

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setConnectionStatus("Connected");
    });

    newSocket.on("connect_error", (error) => {
      console.log("Connection Error:", error);
      setConnectionStatus("Connection Failed");
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnectionStatus("Disconnected");
    });

    setSocket(newSocket);

    // Set up accelerometer listener
    Accelerometer.setUpdateInterval(16); // 60 FPS update rate
    const subscription = Accelerometer.addListener(handleAccelerometerUpdate);

    return () => {
      newSocket.close();
      subscription && subscription.remove();
    };
  }, []);

  const handleAccelerometerUpdate = ({ y }) => {
    setTiltY(y); // Assuming y-axis tilt is relevant for left/right steering
  };

  const handleButtonPress = (button, state) => {
    if (socket) {
      socket.emit("button_press", { button, state });
    }
  };

  const sendTiltData = () => {
    if (socket) {
      socket.emit("tilt_data", { tilt_y: tiltY });
    }
  };

  useEffect(() => {
    const interval = setInterval(sendTiltData); // Send tilt data every 100ms
    return () => clearInterval(interval);
  }, [tiltY]);

  return (
    <View style={styles.container}>
      <Text style={styles.connectionStatus}>{connectionStatus}</Text>
      <View style={styles.gamepadArea}>
        <View style={styles.buttonColumn}>
          <Text style={styles.tiltText}>{tiltY.toFixed(2)}</Text>
        </View>
        <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPressIn={() => handleButtonPress('a', true)}
              onPressOut={() => handleButtonPress('a', false)}
            >
              <Text style={styles.buttonText}>A</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPressIn={() => handleButtonPress('b', true)}
              onPressOut={() => handleButtonPress('b', false)}
            >
              <Text style={styles.buttonText}>S</Text>
            </TouchableOpacity>
   
          </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "90deg" }],
  },
  connectionStatus: {
    position: "absolute",
    top: 10,
    fontSize: 20,
    transform: [{ rotate: "-90deg" }],
  },
  gamepadArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 20,
  },
  buttonText: {
    fontSize: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 20,
    transform: [{ rotate: "90deg" }],
  },
  button: {
    padding: 60,
    margin: 10,
    backgroundColor: "#ccc",
    borderRadius: 20,
    transform: [{ rotate: "-90deg" }],
  },
  buttonColumn: {
    justifyContent: "center",
    alignItems: "center",
  },
  tiltText: {
    fontSize: 24,
    transform: [{ rotate: "-90deg" }],
  },
});

export default App;
