import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView, // Added for better layout handling
} from "react-native";
import socket from "../socket";
import AuthContext from "../context/AuthContext";
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
} from "react-native-agora";

// 🔹 Remote TTS/Audio Mixing Dependencies
import * as FileSystem from 'expo-file-system'; 
import * as Speech from 'expo-speech'; 
// 🔹 STT Dependency
import Voice from "@react-native-voice/voice";
   

// --- CONFIGURATION CONSTANTS ---
// ⚠️ ENSURE this IP is correct and your server is running here!
const BACKEND_URL = "http://192.168.43.118:5000"; 
const AGORA_APP_ID = "26bb74e74bb6431eabe4d223fd13fcbd";
// ------------------------------------------
 export default function VoiceCallScreen({ route }) {
  
  const { profile } = useContext(AuthContext);
  // Call States
  const [myPhone, setMyPhone] = useState("");

  const [receiverPhone, setReceiverPhone] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const [joined, setJoined] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [remoteUid, setRemoteUid] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  // STT & TTS States
  const [captions, setCaptions] = useState("");
  const [typedMessage, setTypedMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // New state for TTS status
  const engineRef = useRef(null);
 
  // 🔹 Socket and Initialization Effects
  useEffect(() => {
    const storedPhone = profile?.phoneNo;
    setMyPhone(String(storedPhone || "")); 
    
    if (route?.params?.receiverPhone) setReceiverPhone(String(route.params.receiverPhone));
    setSocketConnected(socket.connected);
    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);
    const handleCallAccepted = ({ channelName, token }) => {
      setChannelName(String(channelName)); 
      setJoined(true);
      joinAgora(channelName, token);
    };
    const handleCallRejected = ({ message }) => {
    const alertMessage = String(message) || "User rejected your call.";
      Alert.alert("Call Status", alertMessage);
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

  // 🔹 Incoming Call Handler
  useEffect(() => {
    const data = route?.params?.incomingData;
    if (data) {
      setIncomingCall(data);
      
      // 🛑 FIX APPLIED HERE: Coerce data.fromPhone to ensure it is a safe string 
      const callerPhone = String(data.fromPhone || 'Unknown Caller');

      Alert.alert(
        "📞 Incoming Call",
        `From: ${callerPhone}`, // Use the safely coerced variable
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
  // 🔹 Agora Engine Setup (End Call, Join Call, etc. - unchanged)
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
    setChannelName(String(channelName)); 
    setJoined(true);
    joinAgora(channelName, null);
    setIncomingCall(null);
  };
 // Inside VoiceCallScreen.js

const initEngine = () => {
    // 1. If engine exists, return it immediately.
    if (engineRef.current) return engineRef.current; 

    try {
        const rtc = createAgoraRtcEngine();
        rtc.initialize({
            appId: AGORA_APP_ID,
            channelProfile: ChannelProfileType.ChannelProfileCommunication,
        });
        
        // 2. Register all event handlers
        rtc.registerEventHandler({
            onJoinChannelSuccess: () => {
                // Use functional update to ensure you have the latest state
                setJoined(true); 
                // CRITICAL: Ensure captions are reset on new channel join
                setCaptions("");
            },
            onUserJoined: (_, uid) => setRemoteUid((p) => [...p, uid]),
            onUserOffline: (_, uid) => setRemoteUid((p) => p.filter((u) => u !== uid)),
            onAudioMixingFinished: () => {
                if(engineRef.current) engineRef.current.muteLocalAudioStream(false);
                setIsSpeaking(false);
            },
            // Add a handler for RtcEngine errors—these can cause your Text crash
            onError: (err, msg) => {
                console.error("Agora RtcEngine Error:", err, msg);
                // Do not update UI state based on this, just log it.
            }
        });
        
        rtc.enableAudio();
        engineRef.current = rtc;
        return rtc;
    } catch (e) {
        console.error("CRITICAL AGORA INIT FAILED:", e);
        Alert.alert("Engine Error", "Failed to initialize Agora RTC engine.");
        return null; // Return null if initialization fails
    }
};

const joinAgora = (channel, token) => {
    // CRITICAL: Ensure channel name is a string before joining
    const channelString = String(channel);
    try {
        const rtc = initEngine();
        if (!rtc) return; // Stop if init failed

        rtc.muteLocalAudioStream(false);
        rtc.muteAllRemoteAudioStreams(false);
        rtc.setClientRole(ClientRoleType.ClientRoleBroadcaster);
        
        // The last synchronous step before native logic takes over
        rtc.joinChannel(token, channelString, 0, { 
            clientRoleType: ClientRoleType.ClientRoleBroadcaster 
        });
        setChannelName(channelString);
    } catch (e) {
        console.error("Agora join error:", e);
        Alert.alert("Join Error", "Could not connect to Agora channel. Check console.");
        setJoined(false); // Reset joined state on immediate failure
    }
};

const endCall = async () => {
    try {
        stopListening(); 

        if (engineRef.current) {
            // Remove all listeners first to prevent stray updates
            engineRef.current.removeAllListeners(); 
            
            // Graceful leave
            try {
                await engineRef.current.leaveChannel();
            } catch (e) {
                 // Log warning if leave fails, but continue cleanup
                console.warn("Agora leaveChannel warning:", e); 
            }  
            // CRITICAL: Clear the reference after native cleanup
            engineRef.current = null; 
        }
        
    } catch (e) {
        console.error("Critical error during end call cleanup:", e);
       
    } finally {
       
        socket.emit("end-call", { fromPhone: myPhone, toPhone: receiverPhone });
        setJoined(false);
        setRemoteUid([]); 
        setChannelName("");
        setIncomingCall(null);
        setCaptions("");
        setTypedMessage("");
        setIsSpeaking(false);
    }
};
  // 🔹 STT Logic
  useEffect(() => {
    if (isListening) {
      Voice.onSpeechResults = (event) => {
        if (event.value && event.value.length > 0) {
          setCaptions(String(event.value[0])); 
        }
      };
      return () => {
        Voice.onSpeechResults = null;
        Voice.destroy().then(Voice.removeAllListeners); 
      };
    }
  }, [isListening]);


  const startListening = async () => {
    try {
      setCaptions(""); 
      setIsListening(true);
      await Voice.start("en-US");
    } catch (e) {
      console.error("STT Error:", e);
      setIsListening(false);
      Alert.alert("STT Error", "Failed to start speech recognition.");
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

// 🔹 REMOTE TTS (Audio Mixing) Logic
const speakMessage = async () => {
  const message = typedMessage.trim();
  if (!message) return;
  const rtc = engineRef.current;
  if (!rtc || !joined) {
    return Alert.alert("Call Required", "Join an active call first to send TTS.");
  }
  
  setTypedMessage(""); // Clear input immediately
  setIsSpeaking(true);

  try {
    // 1️⃣ Local Feedback using Expo Speech (Optional, but helpful)
    Speech.speak(message, { language: "en-US" });

    // 2️⃣ Request TTS MP3 from backend
    const response = await fetch(`${BACKEND_URL}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });

    if (!response.ok) {
        const errorText = await response.text(); 
        console.error("TTS API failed body:", errorText);
        throw new Error(`TTS generation failed. Status: ${response.status}`);
    }

    const data = await response.json();
    // ⚠️ Ensure your backend returns the URL in 'data.url'
    const remoteUrl = `${BACKEND_URL}${data.url}`; 

    // 3️⃣ Download MP3 to local cache directory
    const localPath = FileSystem.cacheDirectory + `tts_${Date.now()}.mp3`;
    await FileSystem.downloadAsync(remoteUrl, localPath); 

    // 4️⃣ Mute mic temporarily to avoid echo/feedback
    rtc.muteLocalAudioStream(true);

    // 5️⃣ Start audio mixing in Agora (This sends the audio to the remote user)
    // Parameters: filePath, loop (false), replaceMic (false), playVolume (1)
    rtc.startAudioMixing(localPath, false, false, 1);

    // Unmuting is handled by the onAudioMixingFinished event handler now
    // (added in initEngine), making it more robust.

  } catch (err) {
    console.error("TTS Error:", err);
    Alert.alert("TTS Error", err.message || "Unknown error occurred.");
    // Ensure mic is unmuted and speaking state is reset on error
    if(rtc) rtc.muteLocalAudioStream(false); 
    setIsSpeaking(false);
  }
};
return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Voice Relay Call</Text>
        <View style={styles.infoBar}>
            <Text style={styles.infoText}>Your Phone: {String(myPhone)}</Text>
         </View>
         <View>
            <Text style={[styles.infoText, socketConnected ? styles.socketConnected : styles.socketDisconnected]}>
                Socket Status: {socketConnected ? 'Online' : 'Offline'}
            </Text>
        </View>
        <View style={styles.separator} />
        {!joined ? (
          <View style={styles.preCallSection}>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Receiver Phone </Text>
              <TextInput
                placeholder="Enter E.164 phone number"
                value={String(receiverPhone)}
                style={styles.input}
                onChangeText={setReceiverPhone}
                keyboardType="phone-pad"
              />
            </View>
            <TouchableOpacity
              onPress={callUser}
              style={[
                styles.mainButton,
                { backgroundColor: socketConnected ? '#1e90ff' : '#aaa' },
              ]}
              disabled={!socketConnected}
            >
              <Text style={styles.mainButtonText}>{socketConnected ? 'Start Call' : 'Connecting...'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.callView}>
                <View style={styles.statusIndicator}>
                    <Text style={styles.channelText}>Channel: {String(channelName)}</Text>
                    <Text style={styles.statusText}>
                        Status: {remoteUid.length > 0 ? 'Connected' : 'Waiting...'}
                    </Text>
                </View>
                <Text style={styles.sectionHeader}>Live Captions (Your Speech)</Text>
                <ScrollView style={styles.captionBox}>
                  <Text style={styles.captionText}>
                    {String(captions) || "Start listening to see your real-time transcription here..."}
                  </Text>
                </ScrollView>
                <TouchableOpacity
                  onPress={isListening ? stopListening : startListening}
                  style={[
                    styles.listenButton,
                    { backgroundColor: isListening ? "#ff4d4f" : "#52c41a" },
                  ]}
                  disabled={isSpeaking}
                >
                  <Text style={styles.buttonTextWhite}>
                    {isListening ? 'Stop Listening' : 'Start Captions'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.sectionHeader}>Text-to-Speech (Relay Message)</Text>
                <View style={styles.ttsContainer}>
                  <TextInput
                    placeholder="Type message to speak to the remote user..."
                    value={String(typedMessage)}
                    style={styles.ttsInput}
                    onChangeText={setTypedMessage}
                    multiline={true} 
                  />
                  <TouchableOpacity 
                        onPress={speakMessage} 
                        style={[styles.ttsButton, { backgroundColor: isSpeaking ? '#f97316' : '#1e90ff' }]}
                        disabled={!typedMessage.trim() || isSpeaking}
                    >
                    <Text style={styles.buttonTextWhite}>
                      {isSpeaking ? 'Sending...' : 'Speak'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.controlButtons}>
                    <TouchableOpacity
                        onPress={endCall}
                        style={styles.endCallButton}
                    >
                        <Text style={styles.buttonTextWhite}>End Call</Text>
                    </TouchableOpacity>
                </View>

            </View>
        )}

      </View>
    </SafeAreaView>
);
}

// -------------------- STYLESHEET --------------------
// (Using the styles from your second attempt for better layout)

const styles = StyleSheet.create({
    // Global Styling
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5', 
    },
    container: { 
        flex: 1, 
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 10,
    },

    // Header and Info
    title: { 
        fontSize: 26, 
        fontWeight: '700', 
        color: '#1f2937', 
        marginBottom: 8,
    },
    infoBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    infoText: {
        fontSize: 14,
        color: '#6b7280',
    },
    socketConnected: {
        color: '#22c55e', 
        fontWeight: '600',
    },
    socketDisconnected: {
        color: '#f97316', 
        fontWeight: '600',
    },

    // Pre-Call Section
    preCallSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    inputGroup: {
        width: '100%',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 5,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    mainButton: { 
        width: '100%', 
        padding: 18, 
        borderRadius: 12, 
        alignItems: 'center', 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    mainButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    // In-Call Section
    callView: { 
        flex: 1,
        paddingVertical: 10,
        width: '100%', // Ensure call view takes full width
    },
    statusIndicator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        marginBottom: 15,
    },
    channelText: {
        fontSize: 14,
        color: '#6b7280',
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
        marginTop: 15,
        marginBottom: 8,
    },

    // Captions (STT)
    captionBox: {
        width: '100%',
        height: 120,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    captionText: { 
        fontSize: 16, 
        color: '#333',
        lineHeight: 24,
    },
    listenButton: {
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
        width: '100%', // Full width
    },
    buttonTextWhite: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // TTS Input
    ttsContainer: { 
        flexDirection: 'row', 
        width: '100%', 
        marginBottom: 20,
    },
    ttsInput: { 
        flex: 1, 
        minHeight: 80,
        maxHeight: 120, 
        borderWidth: 1, 
        borderColor: '#d1d5db', 
        borderRadius: 12, 
        padding: 15,
        backgroundColor: '#fff',
        fontSize: 15,
        marginRight: 10,
        textAlignVertical: 'top', 
    },
    ttsButton: { 
        width: 80, // Increased width for better text fit
        height: 80, // Matched height for better vertical alignment
        backgroundColor: '#1e90ff', 
        borderRadius: 12, 
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    
    // Control Buttons
    controlButtons: {
        flexDirection: 'row',
        justifyContent: 'center', 
        paddingTop: 10,
    },
    endCallButton: {
        width: '100%', 
        backgroundColor: '#dc2626', 
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
});