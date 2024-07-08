import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import io from 'socket.io-client';
import { Accelerometer } from 'expo-sensors';
import StartScreen from './components/StartScreen';
import GameController from './components/GameController';

const App = () => {
  const [serverIP, setServerIP] = useState('');
  const [serverPort, setServerPort] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [tiltY, setTiltY] = useState(0);
  const [orientation, setOrientation] = useState('PORTRAIT');

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window: { width, height } }) => {
      if (width > height) {
        setOrientation('LANDSCAPE');
      } else {
        setOrientation('PORTRAIT');
      }
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (isConnected) {
      Accelerometer.setUpdateInterval(16);
      const subscription = Accelerometer.addListener(handleAccelerometerUpdate);
      return () => subscription && subscription.remove();
    }
  }, [isConnected]);

  const handleAccelerometerUpdate = ({ y }) => {
    setTiltY(y);
  };

  const connectToServer = () => {
    const newSocket = io(`http://${serverIP}:${serverPort}`);
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnectionStatus('Connected');
      setIsConnected(true);
    });
    newSocket.on('connect_error', (error) => {
      console.log('Connection Error:', error);
      setConnectionStatus('Connection Failed');
    });
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnectionStatus('Disconnected');
      setIsConnected(false);
    });
    setSocket(newSocket);
  };

  const handleButtonPress = (button) => {
    if (socket) {
      socket.emit('button_press', { button, state: 'press' });
    }
  };

  useEffect(() => {
    if (isConnected) {
      const sendTiltData = () => {
        if (socket) {
          socket.emit('tilt_data', { tilt_y: tiltY });
        }
      };
      const interval = setInterval(sendTiltData, 16);
      return () => clearInterval(interval);
    }
  }, [isConnected, socket, tiltY]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {!isConnected ? (
        <StartScreen
          serverIP={serverIP}
          setServerIP={setServerIP}
          serverPort={serverPort}
          setServerPort={setServerPort}
          connectToServer={connectToServer}
          connectionStatus={connectionStatus}
        />
      ) : (
        orientation === 'LANDSCAPE' && (
          <GameController
            connectionStatus={connectionStatus}
            tiltY={tiltY}
            handleButtonPress={handleButtonPress}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;