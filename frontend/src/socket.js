import { io } from "socket.io-client";

const socket = io("http://10.12.249.231:5000", {
  transports: ["websocket"],
  autoConnect: false, // stays false for controlled connect
});

export default socket;
