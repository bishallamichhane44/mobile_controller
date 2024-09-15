import React, { useState,useEffect } from "react";
import { StyleSheet, View, TextInput, Text, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import Orientation from 'react-native-orientation-locker';

const EnterAddress = ({ navigation }) => {
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");

  useEffect(() => {
    Orientation.lockToPortrait(); // Lock to portrait mode
    return () => {
      Orientation.unlockAllOrientations(); // Unlock on unmount
    };
  }, []);

  const HandleButtonPress = () => {
    let address = `ws://${ip}:${port}`;
    console.log(address);
    navigation.navigate("GameController", address);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Connect to Server</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter IP Address"
            placeholderTextColor="#999"
            value={ip}
            onChangeText={setIp}
            keyboardType="alphanumeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Port"
            placeholderTextColor="#999"
            value={port}
            onChangeText={setPort}
            keyboardType="numeric"
            maxLength={5}
          />
          <TouchableOpacity style={styles.button} onPress={HandleButtonPress}>
            <Text style={styles.buttonText}>Connect</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#4a90e2",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EnterAddress;