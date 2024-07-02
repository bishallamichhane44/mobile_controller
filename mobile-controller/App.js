import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, PanResponder } from 'react-native';

export default function App() {
  const [status, setStatus] = useState('Disconnected');
  const ws = useRef(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const connectWebSocket = () => {
    ws.current = new WebSocket('ws://YOUR_IP_ADDRESS:8765');
    
    ws.current.onopen = () => setStatus('Connected');
    ws.current.onclose = () => setStatus('Disconnected');
    ws.current.onerror = (error) => console.error('WebSocket error:', error);
  };

  const sendMessage = (msg) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg));
    }
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      sendMessage({
        type: 'mousemove',
        x: gestureState.dx,
        y: gestureState.dy,
      });
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>Status: {status}</Text>
      <View {...panResponder.panHandlers} style={styles.touchpad} />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => sendMessage({ type: 'click', button: 'left' })}
        >
          <Text>Left Click</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => sendMessage({ type: 'click', button: 'right' })}
        >
          <Text>Right Click</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  statusText: {
    fontSize: 18,
    marginBottom: 20,
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