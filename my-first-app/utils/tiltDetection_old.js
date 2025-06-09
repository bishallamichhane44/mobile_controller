import { DeviceMotion } from "expo-sensors";

const TiltDetection = (socket, enabled = false) => {
  let isActive = true;
  let subscription = null;
  let isEnabled = enabled;
  let lastSentTime = 0;
  let lastSentValue = null;
  
  const THROTTLE_INTERVAL = 100; // Send at most every 100ms (10 FPS)
  const VALUE_THRESHOLD = 0.2; // Only send significant changes

  const onDeviceMotion = (data) => {
    try {
      if (!isActive || !isEnabled || !socket || socket.readyState !== WebSocket.OPEN) {
        return;
      }

      // Check if we have valid data
      if (!data || !data.accelerationIncludingGravity) {
        return;
      }

      const now = Date.now();
      const { y } = data.accelerationIncludingGravity;
      
      // Validate y value
      if (typeof y !== 'number' || isNaN(y)) {
        return;
      }
      
      // Throttle updates
      if (now - lastSentTime < THROTTLE_INTERVAL) {
        return;
      }
      
      const roundedValue = parseFloat(y.toFixed(2));
      
      // Only send if value changed significantly
      if (lastSentValue !== null && Math.abs(roundedValue - lastSentValue) < VALUE_THRESHOLD) {
        return;
      }

      // Send data directly (no async/queue complexity)
      const tiltData = { type: "tilt", value: roundedValue };
      socket.send(JSON.stringify(tiltData));
      
      lastSentTime = now;
      lastSentValue = roundedValue;
      
    } catch (error) {
      console.error('Error in tilt detection:', error);
      // Don't crash, just log the error
    }
  };
  // Initialize with safe error handling
  try {
    // Check if DeviceMotion is available
    if (!DeviceMotion.isAvailableAsync) {
      console.error('DeviceMotion not available');
      isActive = false;
      return {
        cleanup: () => {},
        setEnabled: () => {}
      };
    }
    
    DeviceMotion.setUpdateInterval(100);
    subscription = DeviceMotion.addListener(onDeviceMotion);
    console.log("Tilt detection initialized successfully");
  } catch (error) {
    console.error('Failed to initialize tilt detection:', error);
    isActive = false;
  }

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
