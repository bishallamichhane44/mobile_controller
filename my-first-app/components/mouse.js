import { useState } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  Text,
  TouchableOpacity,
} from "react-native";

const Mouse = ({ socket }) => {
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      if (socket) {
        socket.emit("move", { dx: gestureState.dx, dy: gestureState.dy });
      }
      setDx(gestureState.dx);
      setDy(gestureState.dy);
    },
    onPanResponderRelease: () => {
      setDx(0);
      setDy(0);
    },
  });

  const leftClick = () => {
    if (socket) {
      socket.emit("leftClick");
    }
  };

  const rightClick = () => {
    if (socket) {
      socket.emit("rightClick");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.touchPad} {...panResponder.panHandlers}>
        <Text>Move your finger to control the mouse</Text>
        <Text>
          dx: {dx}, dy: {dy}
        </Text>
      </View>
      <View style={styles.buttonsView}>
        <TouchableOpacity style={styles.buttons} onPress={leftClick}>
          <Text>left Click</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttons} onPress={rightClick}>
          <Text>right Click</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  touchPad: {
    width: "100%",
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsView: {
    width: "100%",
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  buttons: {
    width: "45%",
    // flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "lightgray",
  },
});

export default Mouse;
