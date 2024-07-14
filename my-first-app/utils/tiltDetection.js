import { DeviceMotion } from "expo-sensors";

const UPDATE_INTERVAL = 100; // Update interval in milliseconds

const TiltDetection = (socket) => {
  console.log("Inside tilt", socket);
  const onDeviceMotion = ({ accelerationIncludingGravity }) => {
    const { y } = accelerationIncludingGravity;
    // console.log(y);
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "tilt", value: y.toFixed(2) })); // Send the 'y' value as a string
    }
  };

  // Set update interval and add listener
  DeviceMotion.setUpdateInterval(UPDATE_INTERVAL);
  DeviceMotion.addListener(onDeviceMotion);

  // Return a function to stop tilt tracking
  return () => {
    DeviceMotion.removeAllListeners();
  };
};
export default TiltDetection;
