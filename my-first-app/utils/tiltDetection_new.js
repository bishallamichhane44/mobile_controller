import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';

const TiltDetection = (socket, enabled = false) => {
  let isActive = true;
  let subscription = null;
  let isEnabled = enabled;
  let lastSentTime = 0;
  let lastSentValue = null;
  
  const THROTTLE_INTERVAL = 150; // Send at most every 150ms (6.7 FPS)
  const VALUE_THRESHOLD = 0.3; // Only send significant changes

  const onAccelerometerData = (data) => {
    try {
      if (!isActive || !isEnabled || !socket || socket.readyState !== WebSocket.OPEN) {
        return;
      }

      // Check if we have valid data
      if (!data || typeof data.y !== 'number' || isNaN(data.y)) {
        return;
      }

      const now = Date.now();
      const { y } = data;
      
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
  try {
    // Set update interval for accelerometer
    setUpdateIntervalForType(SensorTypes.accelerometer, 100);
    
    // Subscribe to accelerometer data
    subscription = accelerometer.subscribe(onAccelerometerData);
    console.log("Tilt detection initialized successfully with react-native-sensors");
  } catch (error) {
    console.error('Failed to initialize tilt detection:', error);
    isActive = false;
    return {
      cleanup: () => {},
      setEnabled: () => {}
    };
  }

  // Return control object
  return {
    cleanup: () => {
      try {
        isActive = false;
        if (subscription) {
          subscription.unsubscribe();
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
