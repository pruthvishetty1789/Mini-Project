import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import socket from "../socket"; // global socket instance

export default function VoiceCallScreen({ route, navigation }) {
  const { receiverPhone } = route.params;
  const [myPhone, setMyPhone] = useState(null);
  const [channelName, setChannelName] = useState("");
  const [status, setStatus] = useState("Connecting to server...");

  useEffect(() => {
    const setupScreen = async () => {
      const storedPhone = await AsyncStorage.getItem("myPhone");
      if (!storedPhone) {
        setStatus("❌ Your phone number is not set. Please log in again.");
        return;
      }
      setMyPhone(storedPhone);
      if (!receiverPhone) {
        setStatus("❌ Receiver phone number not provided.");
        return;
      }
      connectSocketAndCall(storedPhone);
    };

    setupScreen();

    return () => {
      socket.off("callAccepted");
      socket.off("user-offline");
      socket.disconnect();
    };
  }, []);

  const connectSocketAndCall = (phone) => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      setStatus("Connected to server. Calling...");
      socket.emit("register", phone); // register your phone with server
      initiateCall(phone);
    });

    // Handle call accepted event
    socket.on("callAccepted", ({ channelName, token }) => {
      setStatus(`📞 In Call on channel: ${channelName}`);
      // Here you would join Agora channel using the token
      // TODO: Integrate Agora SDK for actual audio call
      console.log("Token:", token);
    });

    socket.on("user-offline", () => {
      setStatus("❌ User is not online.");
    });
  };

  const initiateCall = (phone) => {
    const uniqueChannel = `${phone}_${Date.now()}`;
    setChannelName(uniqueChannel);

    socket.emit("call-user", {
      from: phone,
      to: receiverPhone,
      channelName: uniqueChannel,
    });
    console.log(`📞 Calling user: ${receiverPhone} on channel: ${uniqueChannel}`);
  };

  const endCall = () => {
    socket.disconnect();
    setStatus("Call ended");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Call Screen</Text>
      <Text style={styles.label}>Caller: {myPhone || "Loading..."}</Text>
      <Text style={styles.label}>Receiver: {receiverPhone}</Text>
      <Text style={styles.status}>{status}</Text>

      {status.includes("Calling") && <ActivityIndicator size="large" color="#ffaa00" />}

      {status.includes("In Call") && (
        <TouchableOpacity style={styles.endButton} onPress={endCall}>
          <Text style={styles.endText}>End Call</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
  },
  status: {
    fontSize: 18,
    marginVertical: 25,
  },
  endButton: {
    backgroundColor: "#ff5555",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  endText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
