import TiltDetection from "./tiltDetection";

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
    socket.onopen = () => {
    isConnecting = false;
    connectionAttempts = 0;
    clearTimeout(connectionTimeout);
    console.log("Connected to the WebSocket server");
    alert('Socket connected successfully!');
    // NO tilt detection initialization - completely removed
  };

  socket.onclose = (event) => {
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
  };
  // Add method to control tilt detection
  socket.setTiltEnabled = (enabled) => {
    if (enabled && !tiltDetector && socket.readyState === WebSocket.OPEN) {
      // Create tilt detector only when enabling
      try {
        tiltDetector = TiltDetection(socket, true);
        console.log("Tilt detection enabled");
      } catch (error) {
        console.error('Failed to enable tilt detection:', error);
      }
    } else if (!enabled && tiltDetector) {
      // Disable and cleanup tilt detector
      try {
        tiltDetector.cleanup();
        tiltDetector = null;
        console.log("Tilt detection disabled");
      } catch (error) {
        console.error('Failed to disable tilt detection:', error);
      }
    }
  };

  return socket;
};

export default Socket;
