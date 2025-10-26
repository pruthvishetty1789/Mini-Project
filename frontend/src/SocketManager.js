/*
 import { useEffect, useContext } from "react";
import AuthContext from "./context/AuthContext";
import socket from "./socket"; // Assuming this imports the uninitialized Socket.IO client

export default function SocketManager() {
  const { userToken, profile } = useContext(AuthContext);

  useEffect(() => {
    const phoneNo = profile?.phoneNo;
    
    // 1. Check if user is authenticated and has the required identifier
    if (!userToken || !phoneNo) {
      console.log("🔧 SocketManager: Missing token or phoneNo, ensuring socket is disconnected.");
      if (socket.connected) {
          socket.disconnect(); // Ensure it's not connected if user logs out
      }
      return;
    }

    console.log(`🔧 SocketManager: User authenticated (${phoneNo}). Setting up socket.`);
    
    // 2. Define the 'connect' handler where registration occurs
    const onConnect = () => {
      console.log("✅ Socket connected with ID:", socket.id);
      console.log("📤 Emitting register with:", phoneNo);
      // **This is the automatic registration step**
      socket.emit("register", phoneNo); 
    };
    
    // 3. Define other event handlers
    const onRegistered = ({ phoneNo, socketId }) => {
      console.log("✅ Server acknowledged registration:", phoneNo, socketId);
    };

    const onDisconnect = () => {
      console.log("❌ Disconnected from server");
    };

    // 4. Attach handlers
    socket.on("connect", onConnect);
    socket.on("registered", onRegistered);
    socket.on("disconnect", onDisconnect);
    
    // 5. Connect the socket (if not already connected)
    if (!socket.connected) {
      socket.connect();
    }

    // 6. Cleanup function
    return () => {
      console.log("🧹 SocketManager cleanup: Removing listeners.");
      socket.off("connect", onConnect);
      socket.off("registered", onRegistered);
      socket.off("disconnect", onDisconnect);
      
      // OPTIONAL: If the component unmounts AND the user logs out, you might disconnect. 
      // In a typical persistent app, you might NOT disconnect here to allow background syncing.
      // For simplicity, we'll keep it connected unless user data is missing in the check above.
    };

  }, [userToken, profile]); // Dependencies ensure it runs on login/profile change

  return null;
}
  */

/*

import { useEffect, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import AuthContext from "./context/AuthContext";
import socket from "./socket"; // Global socket instance

export default function SocketManager() {
  const { userToken, profile } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    const phoneNo = profile?.phoneNo;

    // 1️⃣ Disconnect if not logged in
    if (!userToken || !phoneNo) {
      console.log("🔧 SocketManager: Missing token or phoneNo, disconnecting...");
      if (socket.connected) socket.disconnect();
      return;
    }

    console.log(`🔧 SocketManager: Authenticated user (${phoneNo}). Setting up socket...`);

    // 2️⃣ Handlers
    const onConnect = () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("register", phoneNo);
    };

    const onRegistered = ({ phoneNo, socketId }) => {
      console.log("✅ Registered on server:", phoneNo, socketId);
    };

    const onDisconnect = () => {
      console.log("❌ Socket disconnected from server");
    };

    // 🔔 Handle incoming call globally
    const onIncomingCall = (data) => {
      console.log("📞 Incoming call from:", data.fromPhone);

      // Navigate to VoiceCall screen and pass call data
      navigation.navigate("VoiceCallScreen", { incomingData: data });
    };

    // 3️⃣ Attach handlers
    socket.on("connect", onConnect);
    socket.on("registered", onRegistered);
    socket.on("disconnect", onDisconnect);
    socket.on("incoming-call", onIncomingCall);

    // 4️⃣ Connect if not connected
    if (!socket.connected) socket.connect();

    // 5️⃣ Cleanup
    return () => {
      console.log("🧹 Cleaning up SocketManager listeners...");
      socket.off("connect", onConnect);
      socket.off("registered", onRegistered);
      socket.off("disconnect", onDisconnect);
      socket.off("incoming-call", onIncomingCall);
    };
  }, [userToken, profile]);

  return null; // This component doesn’t render anything
}

*/

import { useEffect, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import AuthContext from "./context/AuthContext";
import socket from "./socket";

export default function SocketManager() {
  const { userToken, profile } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    const phoneNo = profile?.phoneNo;

    if (!userToken || !phoneNo) {
      console.log("Missing token or phoneNo, disconnecting...");
      if (socket.connected) socket.disconnect();
      return;
    }

    const onConnect = () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("register", phoneNo);
    };

    const onIncomingCall = (data) => {
      console.log("📞 Incoming call from:", data.fromPhone);
      navigation.navigate("VoiceCallScreen", { incomingData: data });
    };

    socket.on("connect", onConnect);
    socket.on("incoming-call", onIncomingCall);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("incoming-call", onIncomingCall);
    };
  }, [userToken, profile]);

  return null;
}
