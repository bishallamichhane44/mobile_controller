import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import io from "socket.io-client";
import { Accelerometer } from "expo-sensors";

const App = () => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [tiltY, setTiltY] = useState(0); // Tilt data along Y-axis

  useEffect(() => {
    const newSocket = io("https://c6c9-103-156-26-247.ngrok-free.app/");

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

  const sendTiltData = () => {
    if (socket) {
      socket.emit("tilt_data", { tilt_y: tiltY });
    }
  };

  useEffect(() => {
    const interval = setInterval(sendTiltData, 1); // Send tilt data every 100ms
    return () => clearInterval(interval);
  }, [tiltY]);

  return (
    <View style={styles.container}>
      <Text style={styles.connectionStatus}>{connectionStatus}</Text>
      <View style={styles.gamepadArea}>
        <View style={styles.buttonColumn}>
          <Text style={styles.tiltText}>Tilt Y: {tiltY.toFixed(2)}</Text>
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
