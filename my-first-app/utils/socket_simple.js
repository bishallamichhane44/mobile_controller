// Simple socket without any tilt detection for testing
const Socket = (address) => {
  const socket = new WebSocket(address);
  console.log("Creating simple socket connection to:", address);
  
  socket.onopen = () => {
    console.log("Connected to the WebSocket server");
    alert('Socket connected successfully!');
  };

  socket.onclose = (event) => {
    console.log("Disconnected from the WebSocket server", event.code, event.reason);
    alert(`Socket connection closed`);
  };

  socket.onerror = (error) => {
    console.error(`WebSocket error:`, error);
    alert(`Socket connection failed: ${error.message || 'Connection error'}`);
  };

  return socket;
};

export default Socket;
