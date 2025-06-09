import { Accelerometer } from 'expo-sensors';

const TiltDetection = (socket, enabled = false) => {
  let isActive = true;
  let subscription = null;
  let isEnabled = enabled;
  let lastSentTime = 0;
  let lastSentValue = null;
  const THROTTLE_INTERVAL = 20; // Send at most every 50ms (20 FPS)
  const VALUE_THRESHOLD = 0.05; // Send more frequent changes

  const onAccelerometerData = ({ y }) => {
    try {
      if (!isActive || !isEnabled || !socket || socket.readyState !== WebSocket.OPEN) {
        return;
      }

      // Check if we have valid data
      if (typeof y !== 'number' || isNaN(y)) {
        return;
      }

      const now = Date.now();
      
      // Throttle updates
      if (now - lastSentTime < THROTTLE_INTERVAL) {
        return;
      }
      
      const roundedValue = parseFloat(y.toFixed(2));
      
      // Only send if value changed significantly
      if (lastSentValue !== null && Math.abs(roundedValue - lastSentValue) < VALUE_THRESHOLD) {
        return;
      }

      // Send data directly
      const tiltData = { type: "tilt", value: roundedValue };
      socket.send(JSON.stringify(tiltData));
      
      lastSentTime = now;
      lastSentValue = roundedValue;
      console.log(`Tilt sent: ${roundedValue}`);
      
    } catch (error) {
      console.error('Error in tilt detection:', error);
      // Don't crash, just log the error
    }
  };

  // Initialize with safe error handling
  const initializeSensor = async () => {
    try {
      // Check if accelerometer is available
      const available = await Accelerometer.isAvailableAsync();
      if (!available) {
        console.error('Accelerometer not available on this device');
        isActive = false;
        return false;
      }

      // Request permissions
      const { status } = await Accelerometer.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('Accelerometer permission not granted');
        isActive = false;
        return false;
      }
        // Set update interval
      Accelerometer.setUpdateInterval(50);
      
      // Subscribe to accelerometer data
      subscription = Accelerometer.addListener(onAccelerometerData);
      console.log("Tilt detection initialized successfully with expo-sensors");
      return true;
    } catch (error) {
      console.error('Failed to initialize tilt detection:', error);
      isActive = false;
      return false;
    }
  };

  // Initialize immediately
  initializeSensor();
  // Return control object
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
        console.log("Tilt detection cleaned up");
      } catch (error) {
        console.error('Error during tilt cleanup:', error);
      }
    },
    setEnabled: (enabled) => {
      isEnabled = enabled;
      console.log(`Tilt detection ${enabled ? 'enabled' : 'disabled'}`);
    }
  };
};

export default TiltDetection;
