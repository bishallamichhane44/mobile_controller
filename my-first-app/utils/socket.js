import TiltDetection from "./tiltDetection";
import TiltDetectionFallback from "./tiltDetectionFallback";
import hapticFeedback from "./hapticFeedback";

const Socket = (address) => {
  let tiltDetector = null;
  let reconnectTimeout = null;
  let isConnecting = false;
  let connectionAttempts = 0;
  const maxReconnectAttempts = 5;
  
  const socket = new WebSocket(address);
  console.log("Creating socket connection to:", address);
  
  // Add connection timeout
  const connectionTimeout = setTimeout(() => {
    if (socket.readyState === WebSocket.CONNECTING) {
      console.log("Connection timeout");
      socket.close();
    }
  }, 10000); // 10 second timeout

  // Handle incoming messages, including vibration
  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      
      if (message.type === 'vibration') {
        // Handle vibration message from server
        hapticFeedback.handleServerVibration(message.left || 0, message.right || 0);
      } else {
        // Handle other message types if needed
        console.log('Received message:', message);
      }
    } catch (error) {
      console.error('Error parsing incoming message:', error);
    }
  };    socket.onopen = () => {
    isConnecting = false;
    connectionAttempts = 0;
    clearTimeout(connectionTimeout);
    console.log("Connected to the WebSocket server");
    alert('Socket connected successfully!');
    
    // NO tilt detection initialization - completely removed
  };  socket.onclose = (event) => {
    isConnecting = false;
    clearTimeout(connectionTimeout);
    console.log("Disconnected from the WebSocket server", event.code, event.reason);
    
    // Don't show alert for normal closure
    if (event.code !== 1000) {
      alert(`Socket connection closed: ${event.reason || 'Connection lost'}`);
    }
    
    // Clean up tilt detection
    if (tiltDetector) {
      try {
        tiltDetector.cleanup();
        tiltDetector = null;
        console.log("Tilt detection stopped");
      } catch (error) {
        console.error('Error cleaning up tilt detection:', error);
      }
    }
  };

  socket.onerror = (error) => {
    isConnecting = false;
    clearTimeout(connectionTimeout);
    console.error(`WebSocket error:`, error);
    alert(`Socket connection failed: ${error.message || 'Connection error'}`);
    
    // Clean up tilt detection on error
    if (tiltDetector) {
      try {
        tiltDetector.cleanup();
        tiltDetector = null;
      } catch (cleanupError) {
        console.error('Error cleaning up tilt detection on error:', cleanupError);
      }
    }
  };

  // Add custom cleanup method
  socket.cleanup = () => {
    clearTimeout(connectionTimeout);
    
    if (tiltDetector) {
      try {
        tiltDetector.cleanup();
        tiltDetector = null;
        console.log("Manual cleanup of tilt detection");
      } catch (error) {
        console.error('Error during socket cleanup:', error);
      }
    }
    
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  };

  // Add method to check if socket is healthy
  socket.isHealthy = () => {
    return socket.readyState === WebSocket.OPEN;
  };  // Add method to control haptic feedback
  socket.setHapticsEnabled = (enabled) => {
    hapticFeedback.setEnabled(enabled);
  };

  // Add method to control tilt detection
  socket.setTiltEnabled = (enabled) => {
    try {
      if (enabled && !tiltDetector && socket.readyState === WebSocket.OPEN) {
        // Try react-native-sensors first
        console.log("Attempting to enable tilt detection with react-native-sensors...");
        try {
          tiltDetector = TiltDetection(socket, true);
          console.log("Tilt detection enabled successfully with react-native-sensors");
        } catch (sensorsError) {
          console.log("react-native-sensors failed, trying fallback method...");
          try {
            tiltDetector = TiltDetectionFallback(socket, true);
            console.log("Tilt detection enabled successfully with fallback method");
          } catch (fallbackError) {
            console.error("Both tilt detection methods failed:", sensorsError, fallbackError);
            throw new Error("All tilt detection methods failed");
          }
        }
      } else if (!enabled && tiltDetector) {
        // Disable and cleanup tilt detector
        console.log("Disabling tilt detection...");
        tiltDetector.cleanup();
        tiltDetector = null;
        console.log("Tilt detection disabled successfully");
      }
    } catch (error) {
      console.error('Error in setTiltEnabled:', error);
      // Clean up on error
      if (tiltDetector) {
        try {
          tiltDetector.cleanup();
        } catch (cleanupError) {
          console.error('Error during cleanup after failure:', cleanupError);
        }
        tiltDetector = null;
      }
      // Show user-friendly error
      alert('Tilt detection failed to initialize. Your device may not support motion sensors.');
    }
  };

  return socket;
};

export default Socket;
