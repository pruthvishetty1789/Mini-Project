/*import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import socket from "../socket";
import AuthContext from "../context/AuthContext";
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
} from "react-native-agora";

// 🔹 NEW imports
import Voice from "@react-native-voice/voice"; // for STT
import Tts from "react-native-tts"; // for TTS

export default function VoiceCallScreen({ route }) {
  const { profile } = useContext(AuthContext);
  const [myPhone, setMyPhone] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const [joined, setJoined] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [remoteUid, setRemoteUid] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  const engineRef = useRef(null);
  const AGORA_APP_ID = "26bb74e74bb6431eabe4d223fd13fcbd";

  // 🔹 NEW states for STT & TTS
  const [captions, setCaptions] = useState(""); // text from speech
  const [typedMessage, setTypedMessage] = useState(""); // message for TTS
  const [isListening, setIsListening] = useState(false);

  // 🔹 Setup user info & socket listeners
  useEffect(() => {
    const storedPhone = profile?.phoneNo;
    setMyPhone(storedPhone);

    if (route?.params?.receiverPhone) setReceiverPhone(route.params.receiverPhone);
    setSocketConnected(socket.connected);

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);
    const handleCallAccepted = ({ channelName, token }) => {
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
  };

  const acceptCall = (data) => {
    const { fromPhone, channelName } = data;
    socket.emit("acceptCall", { toPhone: fromPhone, channelName });
    joinAgora(channelName, null);
    setIncomingCall(null);
  };

  const initEngine = () => {
    if (engineRef.current) return engineRef.current;
    const rtc = createAgoraRtcEngine();
    rtc.initialize({
      appId: AGORA_APP_ID,
      channelProfile: ChannelProfileType.ChannelProfileCommunication,
    });
    rtc.registerEventHandler({
      onJoinChannelSuccess: () => setJoined(true),
      onUserJoined: (_, uid) => setRemoteUid((p) => [...p, uid]),
      onUserOffline: (_, uid) => setRemoteUid((p) => p.filter((u) => u !== uid)),
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
      rtc.joinChannel(token, channel, 0, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
      setChannelName(channel);
    } catch (e) {
      console.error("Agora join error:", e);
    }
  };

  const endCall = async () => {
    if (engineRef.current) {
      engineRef.current.removeAllListeners();
      await engineRef.current.leaveChannel();
    }
    socket.emit("end-call", { fromPhone: myPhone, toPhone: receiverPhone });
    setJoined(false);
    setRemoteUid([]);
    setChannelName("");
    setIncomingCall(null);
    stopListening();
  };

  // 🔹 STT setup
  useEffect(() => {
    Voice.onSpeechResults = (event) => {
      if (event.value && event.value.length > 0) {
        setCaptions(event.value[0]);
      }
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      setIsListening(true);
      await Voice.start("en-US");
    } catch (e) {
      console.error("STT Error:", e);
    }
  };

  const stopListening = async () => {
    try {
      setIsListening(false);
      await Voice.stop();
    } catch (e) {
      console.error("Stop Error:", e);
    }
  };

  // 🔹 TTS play
  const speakMessage = () => {
    if (typedMessage.trim() === "") return;
    Tts.speak(typedMessage);
    setTypedMessage("");
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
            style={[
              styles.button,
              { backgroundColor: socketConnected ? "#ffaa00" : "#ccc" },
            ]}
          >
            <Text>{socketConnected ? "Call" : "Connecting..."}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.callView}>
          <Text>Channel: {channelName}</Text>
          <Text>Status: {remoteUid.length > 0 ? "Connected ✅" : "Waiting..."}</Text>

         
          <ScrollView style={styles.captionBox}>
            <Text style={styles.captionText}>{captions || "Listening..."}</Text>
          </ScrollView>

         
          <View style={styles.ttsContainer}>
            <TextInput
              placeholder="Type message to speak..."
              value={typedMessage}
              style={styles.ttsInput}
              onChangeText={setTypedMessage}
            />
            <TouchableOpacity onPress={speakMessage} style={styles.ttsButton}>
              <Text style={{ color: "#fff" }}>Speak 🔊</Text>
            </TouchableOpacity>
          </View>

       
          <TouchableOpacity
            onPress={isListening ? stopListening : startListening}
            style={[styles.listenButton, { backgroundColor: isListening ? "#ff5555" : "#00b894" }]}
          >
            <Text style={{ color: "white" }}>
              {isListening ? "Stop Listening" : "Start Captions 🎙️"}
            </Text>
          </TouchableOpacity>

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
  captionBox: { width: "90%", height: 120, backgroundColor: "#f9f9f9", borderRadius: 10, marginTop: 15, padding: 10 },
  captionText: { fontSize: 16, color: "#333" },
  ttsContainer: { flexDirection: "row", width: "90%", marginTop: 15 },
  ttsInput: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
  ttsButton: { marginLeft: 8, backgroundColor: "#0984e3", borderRadius: 8, padding: 12 },
  listenButton: { marginTop: 10, padding: 12, borderRadius: 8, width: "80%", alignItems: "center" },
});
*/
import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import socket from "../socket";
import AuthContext from "../context/AuthContext";
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
} from "react-native-agora";

// STT & TTS
import Voice from "@react-native-voice/voice";
import Tts from "react-native-tts";

export default function VoiceCallScreen({ route }) {
  const { profile } = useContext(AuthContext);

  // User & call states
  const [myPhone, setMyPhone] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const [joined, setJoined] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [remoteUid, setRemoteUid] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  // STT & TTS states
  const [captions, setCaptions] = useState("");
  const [typedMessage, setTypedMessage] = useState("");
  const [isListening, setIsListening] = useState(false);

  const engineRef = useRef(null);
  const AGORA_APP_ID = "26bb74e74bb6431eabe4d223fd13fcbd";

  // 🔹 Socket listeners setup
  useEffect(() => {
    const storedPhone = profile?.phoneNo;
    setMyPhone(storedPhone);

    if (route?.params?.receiverPhone) setReceiverPhone(route.params.receiverPhone);
    setSocketConnected(socket.connected);

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    const handleCallAccepted = ({ channelName, token }) => {
      setChannelName(channelName); // 🔹 update UI immediately
      setJoined(true); // 🔹 update joined state
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

  // 🔹 Incoming call handler
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
          {
            text: "Accept",
            onPress: () => acceptCall(data),
          },
        ],
        { cancelable: false }
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
  };

  // 🔹 Accept call
  const acceptCall = (data) => {
    const { fromPhone, channelName } = data;
    socket.emit("acceptCall", { toPhone: fromPhone, channelName });
    setChannelName(channelName);
    setJoined(true);
    joinAgora(channelName, null);
    setIncomingCall(null);
  };

  // 🔹 Agora engine
  const initEngine = () => {
    if (engineRef.current) return engineRef.current;
    const rtc = createAgoraRtcEngine();
    rtc.initialize({
      appId: AGORA_APP_ID,
      channelProfile: ChannelProfileType.ChannelProfileCommunication,
    });
    rtc.registerEventHandler({
      onJoinChannelSuccess: () => setJoined(true),
      onUserJoined: (_, uid) => setRemoteUid((p) => [...p, uid]),
      onUserOffline: (_, uid) => setRemoteUid((p) => p.filter((u) => u !== uid)),
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
      rtc.joinChannel(token, channel, 0, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
      setChannelName(channel);
    } catch (e) {
      console.error("Agora join error:", e);
    }
  };

  // 🔹 End call
  const endCall = async () => {
    if (engineRef.current) {
      engineRef.current.removeAllListeners();
      await engineRef.current.leaveChannel();
    }
    socket.emit("end-call", { fromPhone: myPhone, toPhone: receiverPhone });
    setJoined(false);
    setRemoteUid([]);
    setChannelName("");
    setIncomingCall(null);
    stopListening();
  };

  // 🔹 STT setup
  useEffect(() => {
    Voice.onSpeechResults = (event) => {
      if (event.value && event.value.length > 0) {
        setCaptions(event.value[0]);
      }
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      setIsListening(true);
      await Voice.start("en-US");
    } catch (e) {
      console.error("STT Error:", e);
    }
  };

  const stopListening = async () => {
    try {
      setIsListening(false);
      await Voice.stop();
    } catch (e) {
      console.error("Stop Error:", e);
    }
  };

  const speakMessage = () => {
    if (typedMessage.trim() === "") return;
    Tts.speak(typedMessage);
    setTypedMessage("");
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
            style={[
              styles.button,
              { backgroundColor: socketConnected ? "#ffaa00" : "#ccc" },
            ]}
          >
            <Text>{socketConnected ? "Call" : "Connecting..."}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.callView}>
          <Text>Channel: {channelName}</Text>
          <Text>Status: {remoteUid.length > 0 ? "Connected ✅" : "Waiting..."}</Text>

          {/* Captions */}
          <ScrollView style={styles.captionBox}>
            <Text style={styles.captionText}>{captions || "Listening..."}</Text>
          </ScrollView>

          {/* TTS Input */}
          <View style={styles.ttsContainer}>
            <TextInput
              placeholder="Type message to speak..."
              value={typedMessage}
              style={styles.ttsInput}
              onChangeText={setTypedMessage}
            />
            <TouchableOpacity onPress={speakMessage} style={styles.ttsButton}>
              <Text style={{ color: "#fff" }}>Speak 🔊</Text>
            </TouchableOpacity>
          </View>

          {/* STT Controls */}
          <TouchableOpacity
            onPress={isListening ? stopListening : startListening}
            style={[
              styles.listenButton,
              { backgroundColor: isListening ? "#ff5555" : "#00b894" },
            ]}
          >
            <Text style={{ color: "white" }}>
              {isListening ? "Stop Listening" : "Start Captions 🎙️"}
            </Text>
          </TouchableOpacity>

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
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
  button: { width: "80%", padding: 15, borderRadius: 8, marginVertical: 8, alignItems: "center" },
  callView: { marginTop: 20, alignItems: "center" },
  captionBox: {
    width: "90%",
    height: 120,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginTop: 15,
    padding: 10,
  },
  captionText: { fontSize: 16, color: "#333" },
  ttsContainer: { flexDirection: "row", width: "90%", marginTop: 15 },
  ttsInput: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
  ttsButton: { marginLeft: 8, backgroundColor: "#0984e3", borderRadius: 8, padding: 12 },
  listenButton: { marginTop: 10, padding: 12, borderRadius: 8, width: "80%", alignItems: "center" },
});

