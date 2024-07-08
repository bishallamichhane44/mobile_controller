import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Button from './Button';

const { width, height } = Dimensions.get('window');

const GameController = ({ connectionStatus, tiltY, handleButtonPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.connectionStatus}>{connectionStatus}</Text>
      <View style={styles.leftColumn}>
        <Button title="O" onPress={() => handleButtonPress('O')} />
        <Button title="X" onPress={() => handleButtonPress('X')} />
        <Button title="A" onPress={() => handleButtonPress('A')} />
      </View>
      <View style={styles.centerColumn}>
        <View style={styles.tiltContainer}>
          <Text style={styles.tiltText}>TILT={tiltY.toFixed(3)}</Text>
        </View>
      </View>
      <View style={styles.rightColumn}>
        <Button title="T" onPress={() => handleButtonPress('T')} />
        <Button title="Y" onPress={() => handleButtonPress('Y')} />
        <Button title="B" onPress={() => handleButtonPress('B')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  connectionStatus: {
    position: 'absolute',
    top: 10,
    left: 10,
    fontSize: 16,
  },
  leftColumn: {
    justifyContent: 'space-around',
  },
  centerColumn: {
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  rightColumn: {
    justifyContent: 'space-around',
  },
  tiltContainer: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 10,
  },
  tiltText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GameController;