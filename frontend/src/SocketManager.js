import { useEffect, useContext } from "react";
import AuthContext from "./context/AuthContext";
import socket from "./socket";

export default function SocketManager() {
  const { userToken, profile } = useContext(AuthContext);
  console.log("🔧 SocketManager mounted outside");

  useEffect(() => {
    console.log("🔧 SocketManager mounted");
    console.log("Current userToken:", userToken);
    console.log("Current profile:", profile);
    console.log("Current profile.phoneNo:", profile?.phoneNo);
    if (!userToken || !profile?.phoneNo) {
      console.log("⛔ Missing token or phoneNo, skipping socket setup");
      return;
    }
  socket.connect();
    socket.on("connect", () => {
      console.log("✅ Socket connected with ID:", socket.id);
      console.log("📤 Emitting register with:", profile.phoneNo);
      socket.emit("register", profile.phoneNo);
    });

    socket.on("registered", ({ phoneNo, socketId }) => {
      console.log("✅ Server acknowledged registration:", phoneNo, socketId);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    return () => {
      socket.off("connect");
      socket.off("registered");
      socket.off("disconnect");
    };
  }, [userToken, profile]);

  return null;
}
