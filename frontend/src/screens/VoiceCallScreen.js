/*

import React, { useEffect, useState, useRef, useContext } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from "react-native";
// 💡 IMPORTANT: Import the globally managed socket and AuthContext
import socket from "../socket"; 
import AuthContext from "../context/AuthContext";
import RtcEngine, { RtcLocalView, RtcRemoteView, VideoRenderMode } from "react-native-agora";
import AsyncStorage from '@react-native-async-storage/async-storage';

// UPDATE THESE WITH YOUR ACTUAL CONFIGURATION
const APP_ID = "26bb74e74bb6431eabe4d223fd13fcbd";

export default function VoiceCallScreen({ route, navigation }) {
    // 💡 Use global AuthContext for user data
    const { profile } = useContext(AuthContext);
    
    // State to manage call flow and Agora
    const [myPhone, setMyPhone] = useState("");
    const [receiverPhone, setReceiverPhone] = useState("");
    const [incomingCall, setIncomingCall] = useState(null);
    const [engine, setEngine] = useState(null);
    const [joined, setJoined] = useState(false);
    const [channelName, setChannelName] = useState("");
    const [remoteUid, setRemoteUid] = useState([]);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    // This state now tracks the connection status of the GLOBAL socket
    const [socketConnected, setSocketConnected] = useState(false); 

    // --- EFFECT: Setup User Data and Call Listeners ---
    useEffect(() => {
        const storedPhone = profile?.phoneNo;
        setMyPhone(storedPhone);

        if (route?.params?.receiverPhone) {
            setReceiverPhone(route.params.receiverPhone);
        }

        if (!storedPhone) {
            Alert.alert("Authentication Required", "Please log in first.");
            setIsLoadingAuth(false);
            return;
        }
        setIsLoadingAuth(false);

        // 💡 LISTENERS: Now we ONLY listen for call events on the global socket
        // The global SocketManager should handle connect/disconnect/register events
        
        const handleConnect = () => setSocketConnected(true);
        const handleDisconnect = () => setSocketConnected(false);

        const handleIncomingCall = (data) => {
            setIncomingCall(data);
            Alert.alert(
                "Incoming Call",
                `From: ${data.fromPhone}`,
                [
                    { text: "Reject", onPress: () => {
                        socket.emit("rejectCall", { toPhone: data.fromPhone, channelName: data.channelName });
                        setIncomingCall(null);
                    }},
                    { text: "Accept", onPress: () => acceptCall(data) }
                ]
            );
        };

        const handleCallAccepted = ({ channelName, token }) => {
            console.log("Call accepted by receiver. Joining Agora...");
            console.log(token);
            joinAgora(channelName, token);
        };

        const handleCallRejected = ({ message }) => {
            Alert.alert("Call Status", message || "The user rejected your call.");
            // If the caller is on this screen, they should end their attempt
            if (!joined) endCall(); 
        };

        const handleUserOffline = ({ message }) => Alert.alert("Call Status", message);


        // Attach listeners to the globally imported socket
        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("incoming-call", handleIncomingCall);
        socket.on("callAccepted", handleCallAccepted);
        socket.on("callRejected", handleCallRejected);
        socket.on("user-offline", handleUserOffline);
        
        // Initial check for connection status
        setSocketConnected(socket.connected);

        return () => {
            // Clean up listeners and Agora engine on unmount
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("incoming-call", handleIncomingCall);
            socket.off("callAccepted", handleCallAccepted);
            socket.off("callRejected", handleCallRejected);
            socket.off("user-offline", handleUserOffline);
            
            if (engine) {
                engine.removeAllListeners();
                engine.destroy();
            }
        };
    }, [profile, route]); // Depend on profile for user data

    // --- Call functions ---
    const callUser = () => {
        // 💡 Use the global socket directly
        if (!socket.connected) return Alert.alert("Please wait", "Connecting to server...");
        if (!receiverPhone) return Alert.alert("Error", "Enter receiver phone number.");

        // The sender is initiating the call
        socket.emit("call-user", { from: myPhone, to: receiverPhone, channelName: myPhone });
        console.log("📤 Emitting call-user to:", receiverPhone);
    };

    const acceptCall = (data) => {
        const { fromPhone, channelName } = data;
        // 💡 Use the global socket directly
        socket.emit("acceptCall", { toPhone: fromPhone, channelName });
        console.log("📤 Emitting acceptCall to:", fromPhone);
        setIncomingCall(null);
    };

    // --- Agora functions ---
    const initEngineListeners = (rtc) => {
        // ... (Your existing Agora listeners) ...
        rtc.addListener("UserJoined", (uid) => {
            console.log("👂 Agora: UserJoined", uid);
            setRemoteUid((prev) => [...prev, uid]);
        });

        rtc.addListener("UserOffline", (uid, reason) => {
            console.log("👂 Agora: UserOffline", uid, reason);
            setRemoteUid((prev) => prev.filter((u) => u !== uid));
            
            if (remoteUid.length === 1 && remoteUid.includes(uid)) {
                Alert.alert("Call Ended", "The other user has left the call.");
                endCall();
            }
        });
        
        rtc.addListener("JoinChannelSuccess", (channel, uid, elapsed) => {
            console.log("👂 Agora: JoinChannelSuccess", channel, uid);
        });

        rtc.addListener("Error", (err) => {
            console.error("👂 Agora Error:", err);
            Alert.alert("Agora Error", `Code: ${err}`);
        });
    };

    const joinAgora = async (channel, token) => {
        try {
            const rtc = await RtcEngine.create(APP_ID);
            setEngine(rtc);

            initEngineListeners(rtc);
            
            await rtc.enableAudio();
            await rtc.setChannelProfile(0);
            await rtc.setClientRole(1);
            
            await rtc.joinChannel(token, channel, null, 0); 
            
            setJoined(true);
            setChannelName(channel);
            console.log(`✅ Joined Agora Channel: ${channel}`);
            
        } catch (e) {
            console.error("❌ Agora join error:", e);
            Alert.alert("Join Error", "Failed to join call. Check your network and token.");
        }
    };

    const endCall = async () => {
        if (engine) {
            engine.removeAllListeners();
            await engine.leaveChannel();
            await engine.destroy();
            console.log("✅ Call ended and Agora destroyed.");
        }
        
        // Reset all call-related state
        setJoined(false);
        setChannelName("");
        setRemoteUid([]);
        setEngine(null);
    };
    // ------------------------------------------------------------------

    if (isLoadingAuth) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Loading user data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>One-to-One Voice Call</Text>

            {!joined && (
                <>
                    <Text style={styles.statusText}>Your Phone: {myPhone}</Text>
                    <TextInput
                        placeholder="Receiver Phone"
                        value={receiverPhone} 
                        style={styles.input}
                        onChangeText={setReceiverPhone}
                        editable={!route?.params?.receiverPhone}
                    />

                    <TouchableOpacity 
                        onPress={callUser} 
                        style={[styles.button, { backgroundColor: socketConnected ? '#ffaa00' : '#cccccc' }]} 
                        disabled={!socketConnected}
                    >
                        <Text>{socketConnected ? 'Call' : 'Connecting...'}</Text>
                    </TouchableOpacity>
                </>
            )}

            {joined && (
                <View style={styles.callView}>
                    <Text style={styles.statusText}>In Call: {channelName}</Text>
                    <Text style={styles.statusText}>Status: {remoteUid.length > 0 ? 'Connected' : 'Waiting for user...'}</Text>
                    
                    <TouchableOpacity onPress={endCall} style={[styles.button, { backgroundColor: '#ff5555' }]}>
                        <Text style={{ color: 'white' }}>End Call</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
    input: { width: "80%", borderWidth: 1, borderColor: "#ccc", marginBottom: 10, padding: 10, borderRadius: 8 },
    button: { width: "80%", padding: 15, borderRadius: 8, marginVertical: 8, alignItems: 'center' },
    callView: { marginTop: 20, alignItems: "center" },
    statusText: { fontSize: 16, marginVertical: 5 },
});
*/

/*
import React, { useEffect, useState, useContext } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from "react-native";
import socket from "../socket";
import AuthContext from "../context/AuthContext";
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
} from "react-native-agora";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function VoiceCallScreen({ route, navigation }) {
  const { profile } = useContext(AuthContext);

  const [myPhone, setMyPhone] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const [engine, setEngine] = useState(null);
  const [joined, setJoined] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [remoteUid, setRemoteUid] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  // 🔹 Setup user info & listeners
  useEffect(() => {
    const storedPhone = profile?.phoneNo;
    setMyPhone(storedPhone);

    if (route?.params?.receiverPhone) {
      setReceiverPhone(route.params.receiverPhone);
    }

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    const handleCallAccepted = ({ channelName, token }) => {
      console.log("✅ Call accepted. Joining Agora...");
      joinAgora(channelName, token);
    };

    const handleCallRejected = ({ message }) => {
      Alert.alert("Call Status", message || "User rejected your call.");
      if (!joined) endCall();
    };

    const handleUserOffline = ({ message }) => {
      Alert.alert("Call Status", message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("callAccepted", handleCallAccepted);
    socket.on("callRejected", handleCallRejected);
    socket.on("user-offline", handleUserOffline);

    setSocketConnected(socket.connected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("callAccepted", handleCallAccepted);
      socket.off("callRejected", handleCallRejected);
      socket.off("user-offline", handleUserOffline);
      if (engine) {
        engine.removeAllListeners();
        engine.destroy();
      }
    };
  }, [profile, route]);

  // 🔹 Handle incoming call data from navigation
  useEffect(() => {
    const data = route?.params?.incomingData;
    if (data) {
      console.log("📥 Incoming call data:", data);
      setIncomingCall(data);
      Alert.alert(
        "Incoming Call",
        `From: ${data.fromPhone}`,
        [
          {
            text: "Reject",
            onPress: () => {
              socket.emit("rejectCall", {
                toPhone: data.fromPhone,
                channelName: data.channelName,
              });
              setIncomingCall(null);
            },
          },
          { text: "Accept", onPress: () => acceptCall(data) },
        ]
      );
    }
  }, [route?.params]);

  // 🔹 Call functions
  const callUser = () => {
    if (!socket.connected)
      return Alert.alert("Please wait", "Connecting to server...");
    if (!receiverPhone)
      return Alert.alert("Error", "Enter receiver phone number.");

    socket.emit("call-user", {
      from: myPhone,
      to: receiverPhone,
      channelName: myPhone,
    });
    console.log("📤 Calling:", receiverPhone);
  };

  const acceptCall = (data) => {
    const { fromPhone, channelName } = data;
    socket.emit("acceptCall", { toPhone: fromPhone, channelName });
    console.log("📤 Accepting call from:", fromPhone);
    setIncomingCall(null);
  };

  // 🔹 Agora setup
  const initEngineListeners = (rtc) => {
    rtc.addListener("UserJoined", (uid) => {
      console.log("👂 Agora: UserJoined", uid);
      setRemoteUid((prev) => [...prev, uid]);
    });

    rtc.addListener("UserOffline", (uid, reason) => {
      console.log("👂 Agora: UserOffline", uid, reason);
      setRemoteUid((prev) => prev.filter((u) => u !== uid));

      if (remoteUid.length === 1 && remoteUid.includes(uid)) {
        Alert.alert("Call Ended", "Other user left the call.");
        endCall();
      }
    });

    rtc.addListener("JoinChannelSuccess", (channel, uid) => {
      console.log("✅ Joined Agora Channel:", channel, uid);
    });

    rtc.addListener("Error", (err) => {
      console.error("❌ Agora Error:", err);
      Alert.alert("Agora Error", `Code: ${err}`);
    });
  };

  const joinAgora = async (channel, token) => {
  try {
    const rtc = createAgoraRtcEngine();
    rtc.initialize({
      appId: "26bb74e74bb6431eabe4d223fd13fcbd",
      channelProfile: ChannelProfileType.ChannelProfileCommunication,
    });
    setEngine(rtc);
    initEngineListeners(rtc);

    rtc.enableAudio();
    rtc.setClientRole(ClientRoleType.ClientRoleBroadcaster);

    rtc.joinChannel(token, channel, 0, {
      clientRoleType: ClientRoleType.ClientRoleBroadcaster,
    });

    setJoined(true);
    setChannelName(channel);
    console.log("✅ Agora join success");
  } catch (e) {
    console.error("Agora join error:", e);
    Alert.alert("Join Error", "Failed to join call.");
  }
};


  const endCall = async () => {
    if (engine) {
      engine.removeAllListeners();
      await engine.leaveChannel();
      await engine.destroy();
      console.log("✅ Call ended and Agora destroyed.");
    }

    setJoined(false);
    setChannelName("");
    setRemoteUid([]);
    setEngine(null);
  };

  // 🔹 UI Rendering
  return (
    <View style={styles.container}>
      <Text style={styles.title}>One-to-One Voice Call</Text>

      {!joined && (
        <>
          <Text style={styles.statusText}>Your Phone: {myPhone}</Text>
          <TextInput
            placeholder="Receiver Phone"
            value={receiverPhone}
            style={styles.input}
            onChangeText={setReceiverPhone}
            editable={!route?.params?.receiverPhone}
          />

          <TouchableOpacity
            onPress={callUser}
            style={[
              styles.button,
              { backgroundColor: socketConnected ? "#ffaa00" : "#ccc" },
            ]}
            disabled={!socketConnected}
          >
            <Text>{socketConnected ? "Call" : "Connecting..."}</Text>
          </TouchableOpacity>
        </>
      )}

      {joined && (
        <View style={styles.callView}>
          <Text style={styles.statusText}>In Call: {channelName}</Text>
          <Text style={styles.statusText}>
            Status: {remoteUid.length > 0 ? "Connected" : "Waiting..."}
          </Text>

          <TouchableOpacity
            onPress={endCall}
            style={[styles.button, { backgroundColor: "#ff5555" }]}
          >
            <Text style={{ color: "white" }}>End Call</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
  button: {
    width: "80%",
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: "center",
  },
  callView: { marginTop: 20, alignItems: "center" },
  statusText: { fontSize: 16, marginVertical: 5 },
});
*/

import React, { useEffect, useState, useContext, useRef } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from "react-native";
import socket from "../socket";
import AuthContext from "../context/AuthContext";
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
} from "react-native-agora";

export default function VoiceCallScreen({ route }) {
  const { profile } = useContext(AuthContext);
  const [myPhone, setMyPhone] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const [joined, setJoined] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [remoteUid, setRemoteUid] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  const engineRef = useRef(null); // single engine instance
  const AGORA_APP_ID = "26bb74e74bb6431eabe4d223fd13fcbd";


  // 🔹 Setup user info & socket listeners
  useEffect(() => {
    const storedPhone = profile?.phoneNo;
    setMyPhone(storedPhone);

    if (route?.params?.receiverPhone) setReceiverPhone(route.params.receiverPhone);
    setSocketConnected(socket.connected);

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);
    const handleCallAccepted = ({ channelName, token }) => {
      console.log("✅ Call accepted. Joining Agora...");
      joinAgora(channelName, token);
    };
    const handleCallRejected = ({ message }) => {
      Alert.alert("Call Status", message || "User rejected your call.");
      if (joined) endCall();
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("callAccepted", handleCallAccepted);
    socket.on("callRejected", handleCallRejected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("callAccepted", handleCallAccepted);
      socket.off("callRejected", handleCallRejected);
    };
  }, [profile, route]);

  // 🔹 Handle incoming call
  useEffect(() => {
    const data = route?.params?.incomingData;
    if (data) {
      setIncomingCall(data);
      Alert.alert(
        "📞 Incoming Call",
        `From: ${data.fromPhone}`,
        [
          {
            text: "Reject",
            onPress: () => {
              socket.emit("rejectCall", {
                toPhone: data.fromPhone,
                channelName: data.channelName,
              });
              setIncomingCall(null);
            },
          },
          { text: "Accept", onPress: () => acceptCall(data) },
        ]
      );
    }
  }, [route?.params]);

  // 🔹 Call user
  const callUser = () => {
    if (!socket.connected) return Alert.alert("Please wait", "Connecting...");
    if (!receiverPhone) return Alert.alert("Error", "Enter receiver phone.");

    const uniqueChannel = `${myPhone}_${Date.now()}`;
    setChannelName(uniqueChannel);

    socket.emit("call-user", {
      from: myPhone,
      to: receiverPhone,
      channelName: uniqueChannel,
    });

    console.log(`📤 Calling: ${receiverPhone} on channel: ${uniqueChannel}`);
  };

  // 🔹 Accept incoming call
  const acceptCall = (data) => {
    const { fromPhone, channelName } = data;
    socket.emit("acceptCall", { toPhone: fromPhone, channelName });
    joinAgora(channelName, null); // token generated server-side
    setIncomingCall(null);
  };

  // 🔹 Initialize Agora engine once
  const initEngine = () => {
    if (engineRef.current) return engineRef.current;

    const rtc = createAgoraRtcEngine();
    rtc.initialize({
      appId: AGORA_APP_ID,
      channelProfile: ChannelProfileType.ChannelProfileCommunication,
    });
    

    rtc.registerEventHandler({
      onJoinChannelSuccess: () => {
        console.log("✅ Joined Agora Channel");
        setJoined(true);
      },
      onUserJoined: (_, uid) => {
        console.log("👂 User joined:", uid);
        setRemoteUid((prev) => [...prev, uid]);
      },
      onUserOffline: (_, uid) => {
        console.log("👂 User left:", uid);
        setRemoteUid((prev) => prev.filter((u) => u !== uid));
      },
    });

    rtc.enableAudio();
    engineRef.current = rtc;
    return rtc;
  };

  const joinAgora = (channel, token) => {
    try {
      const rtc = initEngine();
      rtc.enableAudio();
    rtc.muteLocalAudioStream(false);
    rtc.muteAllRemoteAudioStreams(false);
    rtc.setClientRole(ClientRoleType.ClientRoleBroadcaster);
      rtc.joinChannel(token, channel, 0, { clientRoleType: ClientRoleType.ClientRoleBroadcaster });
      setChannelName(channel);
      console.log("🎧 Joined voice channel:", channel);
    } catch (e) {
      console.error("Agora join error:", e);
    }
  };

  const endCall = async () => {
    if (engineRef.current) {
      engineRef.current.removeAllListeners();
      await engineRef.current.leaveChannel();
      console.log("✅ Left Agora channel");
    }
    socket.emit("end-call", { fromPhone: myPhone, toPhone: receiverPhone });

    setJoined(false);
    setRemoteUid([]);
    setChannelName("");
    setIncomingCall(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>One-to-One Voice Call</Text>

      {!joined ? (
        <>
          <Text>Your Phone: {myPhone}</Text>
          <TextInput
            placeholder="Receiver Phone"
            value={receiverPhone}
            style={styles.input}
            onChangeText={setReceiverPhone}
          />
          <TouchableOpacity
            onPress={callUser}
            style={[styles.button, { backgroundColor: socketConnected ? "#ffaa00" : "#ccc" }]}
          >
            <Text>{socketConnected ? "Call" : "Connecting..."}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.callView}>
          <Text>Channel: {channelName}</Text>
          <Text>Status: {remoteUid.length > 0 ? "Connected ✅" : "Waiting..."}</Text>
          <TouchableOpacity onPress={endCall} style={[styles.button, { backgroundColor: "#ff5555" }]}>
            <Text style={{ color: "white" }}>End Call</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: { width: "80%", borderWidth: 1, borderColor: "#ccc", marginBottom: 10, padding: 10, borderRadius: 8 },
  button: { width: "80%", padding: 15, borderRadius: 8, marginVertical: 8, alignItems: "center" },
  callView: { marginTop: 20, alignItems: "center" },
});
