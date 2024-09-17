import TiltDetection from "./tiltDetection";
const Socket = (address) => {
  let tilt = null;
  const socket = new WebSocket(address);
  console.log(socket);
  socket.onopen = () => {
    console.log("Connected to the WebSocket server");
    tilt = TiltDetection(socket);
  };
  socket.onclose = () => {
    console.log("Disconnected from the WebSocket server");
    // tilt();
  };
  socket.onerror = (error) => {
    console.log(`WebSocket error: ${error}`);
  };
  return socket;
};

export default Socket;
