import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import socket from "../socket";
import AuthContext from "../context/AuthContext";
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
} from "react-native-agora";

import RNFS from "react-native-fs";
import Voice from "@react-native-voice/voice";
import Tts from "react-native-tts";

export default function VoiceCallScreen({ route }) {
  const { profile } = useContext(AuthContext);

  const [myPhone, setMyPhone] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const [joined, setJoined] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [remoteUid, setRemoteUid] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  const [captions, setCaptions] = useState("");
  const [typedMessage, setTypedMessage] = useState("");
  const [isListening, setIsListening] = useState(false);

  const engineRef = useRef(null);
  const AGORA_APP_ID = "Agora ID";

  useEffect(() => {
    Tts.setDefaultLanguage("en-US");
    Tts.setDefaultRate(0.5);
    if (Tts.setIgnoreSilentSwitch) {
      Tts.setIgnoreSilentSwitch("ignore");
    }
  }, []);

  useEffect(() => {
    const storedPhone = profile?.phoneNo || profile?.phone || "";
    setMyPhone(storedPhone);

    if (route?.params?.receiverPhone) setReceiverPhone(route.params.receiverPhone);
    setSocketConnected(Boolean(socket?.connected));

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    const handleCallAccepted = ({ channelName: chName, token }) => {
      setChannelName(chName);
      setJoined(true);
      joinAgora(chName, token);
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
            style: "cancel",
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

  const callUser = () => {
    if (!socket?.connected) return Alert.alert("Please wait", "Connecting...");
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
    const { fromPhone, channelName: chName } = data;
    socket.emit("acceptCall", { toPhone: fromPhone, channelName: chName });
    setChannelName(chName);
    setJoined(true);
    joinAgora(chName, null);
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
      onUserJoined: (uid) => setRemoteUid((p) => [...p, uid]),
      onUserOffline: (uid) => setRemoteUid((p) => p.filter((u) => u !== uid)),
    });
    rtc.enableAudio();
    engineRef.current = rtc;
    return rtc;
  };

  const joinAgora = (channel, token) => {
    try {
      const rtc = initEngine();
      rtc.enableAudio();
      rtc.muteLocalAudioStream && rtc.muteLocalAudioStream(false);
      rtc.muteAllRemoteAudioStreams && rtc.muteAllRemoteAudioStreams(false);
      rtc.setClientRole && rtc.setClientRole(ClientRoleType.ClientRoleBroadcaster);

      if (typeof rtc.joinChannel === "function") {
        try {
          rtc.joinChannel(token, channel, 0, {
            clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          });
        } catch (err) {
          try {
            rtc.joinChannel(token, channel);
          } catch (e) {
            console.error("Agora join error (alternate):", e);
          }
        }
      } else {
        console.warn("rtc.joinChannel not available");
      }

      setChannelName(channel);
    } catch (e) {
      console.error("Agora join error:", e);
    }
  };

  const endCall = async () => {
    try {
      if (engineRef.current) {
        try {
          engineRef.current.removeAllListeners &&
            engineRef.current.removeAllListeners();
        } catch (e) {}
        try {
          await engineRef.current.leaveChannel();
        } catch (e) {}
      }
    } catch (e) {
      console.warn("leave error", e);
    }
    socket.emit("end-call", { fromPhone: myPhone, toPhone: receiverPhone });
    setJoined(false);
    setRemoteUid([]);
    setChannelName("");
    setIncomingCall(null);
    stopListening();
  };

  useEffect(() => {
    Voice.onSpeechResults = (event) => {
      if (event.value && event.value.length > 0) {
        setCaptions(event.value[0]);
      }
    };
    return () => {
      Voice.destroy().then(() => Voice.removeAllListeners && Voice.removeAllListeners());
    };
  }, []);

  const startListening = async () => {
    try {
      setIsListening(true);
      await Voice.start("en-US");
    } catch (e) {
      console.error("STT Error:", e);
      setIsListening(false);
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

  const speakMessage = async () => {
    if (!typedMessage.trim()) return;

    const fileName = `tts_${Date.now()}.mp3`;
    const filePath =
      Platform.OS === "android"
        ? `${RNFS.CachesDirectoryPath}/${fileName}`
        : `${RNFS.TemporaryDirectoryPath || RNFS.CachesDirectoryPath}/${fileName}`;

    try {
      if (typeof Tts.saveToFile === "function") {
        await Tts.saveToFile(typedMessage, filePath);
      } else {
        await Tts.speak(typedMessage);
        console.warn("Tts.saveToFile not available in this TTS version.");
        setTypedMessage("");
        return;
      }

      await new Promise((res) => setTimeout(res, 400));

      const rtc = engineRef.current;
      if (rtc && typeof rtc.startAudioMixing === "function") {
        try {
          rtc.startAudioMixing(filePath, false, false, 1);
        } catch (err) {
          console.error("startAudioMixing error:", err);
          Alert.alert("Audio Mix Error", String(err));
        }
      } else {
        console.warn("Agora engine not initialized or startAudioMixing not available.");
      }
    } catch (e) {
      console.error("TTS Mix Error:", e);
      Alert.alert("TTS Error", String(e));
    } finally {
      setTypedMessage("");
    }
  };

  const playTestAudio = async () => {
    try {
      const rtc = engineRef.current;
      if (!rtc) return Alert.alert("Not joined", "Join a channel first");
      const testUrl = "https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav";
      rtc.startAudioMixing && rtc.startAudioMixing(testUrl, false, false, 1);
    } catch (e) {
      console.error("playTestAudio error", e);
      Alert.alert("Test Error", String(e));
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>One-to-One Voice Call</Text>
        <Text style={styles.subtitle}>
          Real-time captions & text-to-speech inside a call
        </Text>
      </View>

      {!joined ? (
        <View style={styles.card}>
          <Text style={styles.label}>Your Phone</Text>
          <Text style={styles.value}>{myPhone || "-"}</Text>

          <Text style={styles.label}>Receiver Phone</Text>
          <TextInput
            placeholder="Enter receiver phone"
            placeholderTextColor="#6b7280"
            value={receiverPhone}
            style={styles.input}
            onChangeText={setReceiverPhone}
          />
          <TouchableOpacity
            onPress={callUser}
            style={[
              styles.button,
              { backgroundColor: socketConnected ? "#facc15" : "#4b5563" },
            ]}
          >
            <Text style={styles.buttonText}>
              {socketConnected ? "Call" : "Connecting..."}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.callHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>In Call</Text>
              <Text style={styles.channelText}>Channel: {channelName}</Text>
            </View>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: remoteUid.length > 0 ? "#22c55e33" : "#f9731633" },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: remoteUid.length > 0 ? "#22c55e" : "#f97316" },
                ]}
              />
              <Text style={styles.statusText}>
                {remoteUid.length > 0 ? "Connected" : "Waiting"}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Live Captions</Text>
          <ScrollView style={styles.captionBox}>
            <Text style={styles.captionText}>{captions || "Listening..."}</Text>
          </ScrollView>

          <Text style={styles.sectionLabel}>Type to Speak</Text>
          <View style={styles.ttsContainer}>
            <TextInput
              placeholder="Type message to speak..."
              placeholderTextColor="#6b7280"
              value={typedMessage}
              style={styles.ttsInput}
              onChangeText={setTypedMessage}
            />
            <TouchableOpacity onPress={speakMessage} style={styles.ttsButton}>
              <Text style={styles.ttsButtonText}>Speak 🔊</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={isListening ? stopListening : startListening}
            style={[
              styles.listenButton,
              { backgroundColor: isListening ? "#ef4444" : "#22c55e" },
            ]}
          >
            <Text style={styles.listenButtonText}>
              {isListening ? "Stop Listening" : "Start Captions 🎙"}
            </Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity
              onPress={playTestAudio}
              style={[styles.secondaryButton, { flex: 1, marginRight: 8 }]}
            >
              <Text style={styles.secondaryButtonText}>Play TTS Test</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={endCall}
              style={[styles.endButton, { flex: 1, marginLeft: 8 }]}
            >
              <Text style={styles.endButtonText}>End Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617", // slate-950
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#e5e7eb", // gray-200
  },
  subtitle: {
    fontSize: 13,
    color: "#9ca3af", // gray-400
    marginTop: 4,
  },

  card: {
    flex: 1,
    backgroundColor: "#020617", // same but add border & shadow
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f2937", // gray-800
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  label: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#e5e7eb",
    marginBottom: 16,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#374151",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 15,
    marginBottom: 16,
  },

  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 999,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 16,
  },

  callView: {
    marginTop: 20,
    alignItems: "center",
  },

  callHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  channelText: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 2,
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#e5e7eb",
    fontWeight: "500",
  },

  sectionLabel: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 8,
    marginBottom: 4,
  },

  captionBox: {
    width: "100%",
    height: 130,
    backgroundColor: "#020617",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 10,
  },
  captionText: {
    fontSize: 16,
    color: "#e5e7eb",
  },

  ttsContainer: {
    flexDirection: "row",
    width: "100%",
    marginTop: 8,
    alignItems: "center",
  },
  ttsInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#020617",
    color: "#e5e7eb",
    fontSize: 14,
  },
  ttsButton: {
    marginLeft: 8,
    backgroundColor: "#0ea5e9",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  ttsButtonText: {
    color: "#0b1120",
    fontWeight: "600",
    fontSize: 14,
  },

  listenButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 999,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  listenButtonText: {
    color: "#f9fafb",
    fontWeight: "600",
    fontSize: 15,
  },

  row: {
    flexDirection: "row",
    marginTop: 12,
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020617",
  },
  secondaryButtonText: {
    color: "#e5e7eb",
    fontWeight: "500",
    fontSize: 14,
  },
  endButton: {
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
  },
  endButtonText: {
    color: "#f9fafb",
    fontWeight: "600",
    fontSize: 15,
  },
});
