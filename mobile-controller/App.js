// First, install Expo CLI globally if you haven't already
// npm install -g expo-cli

// Then, create a new Expo project
// expo init RemoteMouse
// cd RemoteMouse

// Install necessary dependencies
// expo install react-native-gesture-handler expo-sensors react-native-reanimated

// App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

export default function App() {
  const [wsConnection, setWsConnection] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://192.168.1.102:8765');
    
    ws.onopen = () => {
      console.log('Connected to the server');
      setConnected(true);
      setWsConnection(ws);
    };

    ws.onclose = () => {
      console.log('Disconnected from the server');
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const onPanGestureEvent = ({ nativeEvent }) => {
    if (wsConnection) {
      wsConnection.send(JSON.stringify({
        type: 'mousemove',
        x: nativeEvent.translationX,
        y: nativeEvent.translationY,
      }));
    }
  };

  const sendClick = (button) => {
    if (wsConnection) {
      wsConnection.send(JSON.stringify({
        type: 'click',
        button: button,
      }));
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.statusContainer}>
        <Text>Status: {connected ? 'Connected' : 'Disconnected'}</Text>
      </View>
      <PanGestureHandler onGestureEvent={onPanGestureEvent}>
        <View style={styles.touchpad} />
      </PanGestureHandler>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => sendClick('left')}>
          <Text>Left Click</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => sendClick('right')}>
          <Text>Right Click</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  statusContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  touchpad: {
    width: 300,
    height: 300,
    backgroundColor: '#DDDDDD',
    borderRadius: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
});