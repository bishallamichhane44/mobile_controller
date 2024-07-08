import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const StartScreen = ({ serverIP, setServerIP, serverPort, setServerPort, connectToServer, connectionStatus }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Controller Setup</Text>
      <TextInput
        style={styles.input}
        placeholder="Server IP Address"
        value={serverIP}
        onChangeText={setServerIP}
      />
      <TextInput
        style={styles.input}
        placeholder="Server Port"
        value={serverPort}
        onChangeText={setServerPort}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.connectButton} onPress={connectToServer}>
        <Text style={styles.connectButtonText}>Connect</Text>
      </TouchableOpacity>
      <Text style={styles.statusText}>{connectionStatus}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  connectButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
  },
  statusText: {
    marginTop: 10,
  },
});

export default StartScreen;