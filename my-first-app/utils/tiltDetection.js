import { DeviceMotion } from "expo-sensors";

const UPDATE_INTERVAL = 100; // Slower update interval to prevent overwhelming
let lastSentTime = 0;
let lastSentValue = null;
const THROTTLE_INTERVAL = 50; // Send at most every 50ms (20 FPS)
const VALUE_THRESHOLD = 0.15; // Higher threshold to reduce noise
const SEND_QUEUE_SIZE = 5; // Limit queue size

const TiltDetection = (socket, enabled = false) => { // Default to OFF
  let isActive = true;
  let subscription = null;
  let sendQueue = [];
  let isSending = false;
  let isEnabled = enabled;

  const processSendQueue = async () => {
    if (isSending || sendQueue.length === 0 || !isEnabled) {
      return;
    }
    
    isSending = true;
    
    while (sendQueue.length > 0 && socket && socket.readyState === WebSocket.OPEN && isEnabled) {
      const data = sendQueue.shift();
      try {
        socket.send(JSON.stringify(data));
        // Small delay between sends to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 5));
      } catch (error) {
        console.error('Failed to send tilt data:', error);
        break;
      }
    }
    
    isSending = false;
  };

  const onDeviceMotion = ({ accelerationIncludingGravity }) => {
    if (!isActive || !isEnabled || !socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const now = Date.now();
    const { y } = accelerationIncludingGravity;
    
    // Throttle updates
    if (now - lastSentTime < THROTTLE_INTERVAL) {
      return;
    }
    
    const roundedValue = parseFloat(y.toFixed(2));
    
    // Only send if value changed significantly
    if (lastSentValue !== null && Math.abs(roundedValue - lastSentValue) < VALUE_THRESHOLD) {
      return;
    }

    // Add to queue instead of sending directly
    if (sendQueue.length < SEND_QUEUE_SIZE) {
      sendQueue.push({ type: "tilt", value: roundedValue });
      lastSentTime = now;
      lastSentValue = roundedValue;
      
      // Process queue
      processSendQueue();
    }
  };

  // Set update interval and add listener
  DeviceMotion.setUpdateInterval(UPDATE_INTERVAL);
  subscription = DeviceMotion.addListener(onDeviceMotion);

  // Return an object with cleanup and control methods
  return {
    cleanup: () => {
      isActive = false;
      if (subscription) {
        subscription.remove();
        subscription = null;
      }
      // Clear queue and reset state
      sendQueue = [];
      lastSentTime = 0;
      lastSentValue = null;
      isSending = false;
    },
    setEnabled: (enabled) => {
      isEnabled = enabled;
      if (!enabled) {
        // Clear queue when disabled
        sendQueue = [];
      }
    }
  };
};
export default TiltDetection;
