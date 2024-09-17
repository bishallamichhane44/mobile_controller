import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import Socket from "../utils/socket";
import * as ScreenOrientation from 'expo-screen-orientation';

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
      const newSocket = Socket(address); // Use the Socket function from socket.js

      newSocket.onopen = () => {
        alert('Socket connected successfully!');
      };

      newSocket.onerror = (error) => {
        alert('Socket connection failed: ' + error.message);
      };

      newSocket.onclose = () => {
        alert('Socket connection closed.');
      };

      setSocket(newSocket);
    } catch (error) {
      alert('An error occurred: ' + error.message);
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [address]);

  const handlePressIn = (button) => {
    console.log("handlePressIn", button);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "pressIn", value: button }));
    }
  };

  const handlePressOut = (button) => {
    console.log("handlePressOut", button);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "pressOut", value: button }));
    }
  };

  const Button = ({ label, value, style }) => (
    <TouchableOpacity
      style={[styles.button, style, pressedButtons.has(value) && styles.pressedButton]}
      onPressIn={() => handlePressIn(value)}
      onPressOut={() => handlePressOut(value)}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: '#f0f0f0',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadMiddle: {
    flexDirection: "row",
    alignItems: 'center',
  },
  dpadCenter: {
    width: 50,
    height: 50,
    backgroundColor: '#ccc',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTop: {
    marginBottom: 20,
  },
  actionMiddle: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: '100%',
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

export default GameController;