import TiltDetection from "./tiltDetection";
const Socket = (address) => {
  let tilt = null;
  const socket = new WebSocket(address);
  console.log(socket);
  socket.onopen = () => {
    console.log("Connected to the WebSocket server");
    alert('Socket connected successfully!');
    tilt = TiltDetection(socket);
  };
  socket.onclose = () => {
    console.log("Disconnected from the WebSocket server");
    alert('Socket connection closed');
    // tilt();
  };
  socket.onerror = (error) => {
    console.error(`WebSocket error: ${error}`);
    alert('Socket connection Failed.' + error.message);
  };
  return socket;
};

export default Socket;
