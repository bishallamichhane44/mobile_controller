// Fallback tilt detection using React Native's built-in DeviceEventEmitter
import { DeviceEventEmitter, NativeModules } from 'react-native';

const TiltDetectionFallback = (socket, enabled = false) => {
  let isActive = true;
  let subscription = null;
  let isEnabled = enabled;
  let lastSentTime = 0;
  let lastSentValue = null;
  
  const THROTTLE_INTERVAL = 200; // Even slower updates
  const VALUE_THRESHOLD = 0.4; // Higher threshold

  const onAccelerometerData = (data) => {
    try {
      if (!isActive || !isEnabled || !socket || socket.readyState !== WebSocket.OPEN) {
        return;
      }

      if (!data || typeof data.y !== 'number' || isNaN(data.y)) {
        return;
      }

      const now = Date.now();
      const { y } = data;
      
      if (now - lastSentTime < THROTTLE_INTERVAL) {
        return;
      }
      
      const roundedValue = parseFloat(y.toFixed(2));
      
      if (lastSentValue !== null && Math.abs(roundedValue - lastSentValue) < VALUE_THRESHOLD) {
        return;
      }

      const tiltData = { type: "tilt", value: roundedValue };
      socket.send(JSON.stringify(tiltData));
      
      lastSentTime = now;
      lastSentValue = roundedValue;
      console.log(`Fallback tilt sent: ${roundedValue}`);
      
    } catch (error) {
      console.error('Error in fallback tilt detection:', error);
    }
  };

  try {
    // Listen for accelerometer events using DeviceEventEmitter
    subscription = DeviceEventEmitter.addListener('accelerometer', onAccelerometerData);
    console.log("Fallback tilt detection initialized");
  } catch (error) {
    console.error('Failed to initialize fallback tilt detection:', error);
    isActive = false;
    return {
      cleanup: () => {},
      setEnabled: () => {}
    };
  }

  return {
    cleanup: () => {
      try {
        isActive = false;
        if (subscription) {
          subscription.remove();
          subscription = null;
        }
        lastSentTime = 0;
        lastSentValue = null;
        console.log("Fallback tilt detection cleaned up");
      } catch (error) {
        console.error('Error during fallback tilt cleanup:', error);
      }
    },
    setEnabled: (enabled) => {
      isEnabled = enabled;
      console.log(`Fallback tilt detection ${enabled ? 'enabled' : 'disabled'}`);
    }
  };
};

export default TiltDetectionFallback;
