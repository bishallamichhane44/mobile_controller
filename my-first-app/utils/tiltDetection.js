import { DeviceMotion } from "expo-sensors";

const UPDATE_INTERVAL = 100; // Update interval in milliseconds
let currentY = 0; // Module to store the current 'y' value

const TiltDetection = (socket) => {
  console.log("Inside tilt", socket);
  const onDeviceMotion = ({ accelerationIncludingGravity }) => {
    const { y } = accelerationIncludingGravity;
    currentY = y; // Update the current 'y' value
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

// Function to get the current 'y' value
export const getCurrentY = () => currentY;

export default TiltDetection;
