import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Button, TouchableOpacity } from "react-native";
import io from "socket.io-client";

const App = () => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [tiltData, setTiltData] = useState(0.0);

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

  const Buttons = [
    ["w", "O"],
    ["a", "T"],
    ["s", "X"],
    ["d", "Y"],
    ["d", "A"],
    ["d", "B"],
  ].map((button) => {
    return (
      <TouchableOpacity
        key={button[1]}
        style={styles.button}
        onPressIn={() => handleButtonPress(button[0], true)}
        onPressOut={() => handleButtonPress(button[0], false)}
      >
        <Text style={styles.buttonText}>{button[1]}</Text>
      </TouchableOpacity>
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.twoButtons}>{[Buttons[0], Buttons[1]]}</View>
      <View style={styles.twoButtons}>{[Buttons[2], Buttons[3]]}</View>
      <View style={[styles.twoButtons, { marginTop: 20 }]}>
        {Buttons[4]}
        <View>
          <TouchableOpacity
            style={styles.button}
            onPressIn={() => handleButtonPress("space", true)}
            onPressOut={() => handleButtonPress("space", false)}
          >
            <Text style={[styles.buttonText, styles.space]}>
              Tilt:{tiltData}
            </Text>
          </TouchableOpacity>
        </View>
        {Buttons[5]}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    margin: 8,
    backgroundColor: "#ccc",
    borderRadius: 10,
  },
  twoButtons: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  space: {
    paddingHorizontal: 90,
  },

  buttonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default App;
