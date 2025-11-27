
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