import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Button, TouchableOpacity } from "react-native";
import io from "socket.io-client";


const App = () => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  useEffect(() => {
    // Replace with your actual ngrok URL/or websocket url
    const newSocket = io("YOUR_NGROK_URL_OR_WEBSOCKET_URL");

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

    return () => newSocket.close();
  }, []);

  const handleButtonPress = (button, state) => {
    if (socket) {
      socket.emit("button_press", { button, state });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.connectionStatus}>{connectionStatus}</Text>
      <View style={styles.gamepadArea}>
        <View style={styles.buttonColumn}>
          <TouchableOpacity
            style={[styles.button, styles.buttonUp]}
            onPressIn={() => handleButtonPress('w', true)}
            onPressOut={() => handleButtonPress('w', false)}
          >
            <Text style={styles.buttonText}>W</Text>
          </TouchableOpacity>
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
              onPressIn={() => handleButtonPress('s', true)}
              onPressOut={() => handleButtonPress('s', false)}
            >
              <Text style={styles.buttonText}>S</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPressIn={() => handleButtonPress('d', true)}
              onPressOut={() => handleButtonPress('d', false)}
            >
              <Text style={styles.buttonText}>D</Text>
            </TouchableOpacity>
          </View>
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  button: {
    padding: 30,
    margin: 10,
    backgroundColor: "#ccc",
    borderRadius: 10,
    transform: [{ rotate: "-90deg" }],
  },
  buttonUp: {
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 24,
  },
});

export default App;