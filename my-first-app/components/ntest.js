import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getCurrentY } from '../utils/tiltDetection'; // Adjust the path as necessary
import Socket from "../utils/socket"; // Adjust the import as necessary

const GameController = ({ route }) => {
  const address = route.params;
  const [socket, setSocket] = useState(null);
  const [pressedButtons, setPressedButtons] = useState(new Set());
  const [yValue, setYValue] = useState(0);

  useEffect(() => {
    const newSocket = new WebSocket(address);
    newSocket.onopen = () => {
      console.log('Connected to the WebSocket server');
    };
    newSocket.onclose = () => {
      console.log('Disconnected from the WebSocket server');
    };
    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, [address]);

  useEffect(() => {
    let animationFrameId;
    let lastUpdateTime = 0;
    const updateInterval = 100; // Update every 100 milliseconds

    const updateTiltValue = (timestamp) => {
      if (timestamp - lastUpdateTime >= updateInterval) {
        setYValue(getCurrentY());
        lastUpdateTime = timestamp;
      }
      animationFrameId = requestAnimationFrame(updateTiltValue);
    };

    animationFrameId = requestAnimationFrame(updateTiltValue);

    return () => cancelAnimationFrame(animationFrameId); // Cleanup on unmount
  }, []);

  const handlePressIn = (button) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setPressedButtons(prev => new Set(prev).add(button));
      socket.send(JSON.stringify({ type: "pressIn", value: button }));
    }
  };

  const handlePressOut = (button) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setPressedButtons(prev => {
        const newSet = new Set(prev);
        newSet.delete(button);
        return newSet;
      });
      socket.send(JSON.stringify({ type: "pressOut", value: button }));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topButtons}>
        <TouchableOpacity onPressIn={() => handlePressIn('start')} onPressOut={() => handlePressOut('start')} style={styles.topButton}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity onPressIn={() => handlePressIn('select')} onPressOut={() => handlePressOut('select')} style={styles.topButton}>
          <Text style={styles.buttonText}>Select</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.controlContainer}>
        <View style={styles.dpad}>
          <TouchableOpacity onPressIn={() => handlePressIn('up')} onPressOut={() => handlePressOut('up')} style={styles.dpadButton}>
            <Text style={styles.buttonText}>↑</Text>
          </TouchableOpacity>
          <View style={styles.dpadMiddleRow}>
            <TouchableOpacity onPressIn={() => handlePressIn('left')} onPressOut={() => handlePressOut('left')} style={styles.dpadButton}>
              <Text style={styles.buttonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.dpadCenter} />
            <TouchableOpacity onPressIn={() => handlePressIn('right')} onPressOut={() => handlePressOut('right')} style={styles.dpadButton}>
              <Text style={styles.buttonText}>→</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPressIn={() => handlePressIn('down')} onPressOut={() => handlePressOut('down')} style={styles.dpadButton}>
            <Text style={styles.buttonText}>↓</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPressIn={() => handlePressIn('y')} onPressOut={() => handlePressOut('y')} style={styles.actionButton}>
            <Text style={styles.buttonText}>Y</Text>
          </TouchableOpacity>
          <View style={styles.actionMiddleRow}>
            <TouchableOpacity onPressIn={() => handlePressIn('x')} onPressOut={() => handlePressOut('x')} style={styles.actionButton}>
              <Text style={styles.buttonText}>X</Text>
            </TouchableOpacity>
            <View style={styles.dpadCenter} />
            <TouchableOpacity onPressIn={() => handlePressIn('b')} onPressOut={() => handlePressOut('b')} style={styles.actionButton}>
              <Text style={styles.buttonText}>B</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPressIn={() => handlePressIn('a')} onPressOut={() => handlePressOut('a')} style={styles.actionButton}>
            <Text style={styles.buttonText}>A</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.tiltContainer}>
        <Text style={styles.tiltText}>Tilt: {yValue.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  topButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
  },
  topButton: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
    margin: 5,
    borderRadius: 5,
  },
  controlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  dpad: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dpadMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
    margin: 5,
    borderRadius: 5,
  },
  dpadCenter: {
    width: 50,
    height: 50,
  },
  tiltContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  tiltText: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
  },
  actionButtons: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  actionButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
    margin: 5,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    color: '#000',
  },
});

export default GameController;