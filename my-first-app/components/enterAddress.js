import { StyleSheet, View, TextInput, Text, Button } from "react-native";
import { useState } from "react";
import Socket from "../utils/socket";
const EnterAddress = ({ navigation }) => {
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const HandleButtonPress = () => {
    let address = `ws://${ip}:${port}`;
    console.log(address);
    navigation.navigate("GameController", address);
  };
  return (
    <View style={styles.container}>
      <View style={styles.innerCont}>
        <TextInput
          editable
          maxLength={40}
          onChangeText={(text) => setIp(text)}
          value={ip}
          placeholder="IP"
          style={styles.input}
        />

        <TextInput
          editable
          maxLength={5}
          onChangeText={(text) => setPort(text)}
          value={port}
          style={styles.input}
          placeholder="PORT"
        />
        <Button onPress={HandleButtonPress} color="#841584" title="Connect" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100vh",
    alignItems: "center",
    justifyContent: "center",
  },
  innerCont: {
    width: "90%",
  },
  input: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: "white",
  },
});

export default EnterAddress;
