import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

const Keypad = ({ route }) => {
  const socket = route.params;

  function handlePressIn(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log(data);
      socket.send(
        JSON.stringify({ from: "keypad", type: "pressIn", value: data })
      );
    }
  }

  function handlePressOut(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({ from: "keypad", type: "pressOut", value: data })
      );
    }
  }

  const buttonsData = [
    ["w", "↑"],
    ["a", "←"],
    ["s", "↓"],
    ["d", "→"],
    ["k", "A"],
    ["j", "B"],
  ];

  const Buttons = buttonsData.map((data) => (
    <TouchableOpacity
      key={data[1]}
      style={styles.button}
      onPressIn={() => handlePressIn(data[0])}
      onPressOut={() => handlePressOut(data[0])}
    >
      <Text style={styles.buttonText}>{data[1]}</Text>
    </TouchableOpacity>
  ));

  return (
    <View style={styles.container}>
      <View style={styles.mainLayout}>
        <View style={styles.directionalPad}>
          <View style={styles.row}>{Buttons[0]}</View>
          <View style={styles.row}>
            {Buttons[1]}
            <View style={styles.centerButtonPlaceholder} />
            {Buttons[3]}
          </View>
          <View style={styles.row}>{Buttons[2]}</View>
        </View>

        <View style={styles.actionPad}>
          {Buttons[4]}
          {Buttons[5]}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.spaceButton]}
        onPressIn={() => handlePressIn("space")}
        onPressOut={() => handlePressOut("space")}
      >
        <Text style={styles.spaceText}>Space</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2C2C2E",
    justifyContent: "flex-end",
  },
  mainLayout: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  directionalPad: {
    flexDirection: "column",
    alignItems: "center",
    width: "40%",
  },
  actionPad: {
    flexDirection: "column",
    alignItems: "center",
    width: "40%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  centerButtonPlaceholder: {
    width: 60,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    margin: 5,
    backgroundColor: "#4B4B4D",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  spaceButton: {
    alignSelf: "center",
    width: 140,
    backgroundColor: "#5A5A5C",
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 20,
    color: "#FFF",
    fontWeight: "bold",
  },
  spaceText: {
    fontSize: 18,
    color: "#FFF",
  },
});

export default Keypad;
