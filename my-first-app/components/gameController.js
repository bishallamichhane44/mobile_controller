import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import Socket from "../utils/socket";

const GameController = ({ route }) => {
  const address = route.params;
  console.log(address);
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    setSocket(Socket(address));
    // return () => socket.close();
  }, []);
  function handlePressIn(data) {
    if (socket) {
      console.log(data);
      socket.send(JSON.stringify({ type: "pressIn", value: data }));
    }
  }
  function handlePressOut(data) {
    if (socket) {
      socket.send(JSON.stringify({ type: "pressOut", value: data }));
    }
  }

  const Buttons = [
    ["up", "O"],
    ["a", "T"],
    ["left", "X"],
    ["right", "Y"],
    ["down", "A"],
    ["d", "B"],
  ].map((data) => {
    return (
      <TouchableOpacity
        key={data[1]}
        style={styles.button}
        onPressIn={() => {
          handlePressIn(data[0]);
        }}
        onPressOut={() => {
          handlePressOut(data[0]);
        }}
      >
        <Text style={styles.buttonText}>{data[1]}</Text>
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
            onPressIn={() => {
              handlePressIn("space");
            }}
            onPressOut={() => {
              handlePressOut("space");
            }}
          >
            <Text style={[styles.buttonText, styles.space]}>Tilt:{0}</Text>
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

export default GameController;
