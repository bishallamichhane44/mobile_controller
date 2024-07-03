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
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPressIn={() => handleButtonPress('w', true)}>
            <Text>W</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPressIn={() => handleButtonPress('a', true)}>
            <Text>A</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPressIn={() => handleButtonPress('s', true)}>
            <Text>S</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPressIn={() => handleButtonPress('d', true)}>
            <Text>D</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPressIn={() => handleButtonPress('up', true)}>
            <Text>Up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPressIn={() => handleButtonPress('down', true)}>
            <Text>Down</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPressIn={() => handleButtonPress('left', true)}>
            <Text>Left</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPressIn={() => handleButtonPress('right', true)}>
            <Text>Right</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPressIn={() => handleButtonPress('button1', true)}>
            <Text>Button 1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPressIn={() => handleButtonPress('button2', true)}>
            <Text>Button 2</Text>
          </TouchableOpacity>
          {/* Add more buttons here as needed */}
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
  },
  connectionStatus: {
    marginBottom: 20,
    fontSize: 20,
  },
  gamepadArea: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  button: {
    padding: 15,
    backgroundColor: "#ccc",
    borderRadius: 5,
  },
});

export default App;
