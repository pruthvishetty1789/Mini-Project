import { io } from "socket.io-client";

// For web: use localhost
// For mobile: replace localhost with your PC IP (e.g. http://192.168.1.5:5000)
const socket = io("http://192.168.43.118:5000", {
  transports: ["websocket"], // ensures websocket first
  autoConnect: false, // ✅ Prevents premature connection
});

export default socket;
