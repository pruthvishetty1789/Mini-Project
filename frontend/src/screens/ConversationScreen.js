import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  Platform,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

// ---------------------- Emoji Data ----------------------
const EMOJIS = [
  { id: '1', emoji: '👋', label: "Hello!" },
  { id: '2', emoji: '😄', label: "I'm happy today" },
  { id: '3', emoji: '😂', label: "I'm laughing a lot" },
  { id: '4', emoji: '😍', label: "I love this" },
  { id: '5', emoji: '🤔', label: "I'm thinking about something" },
  { id: '6', emoji: '😢', label: "I'm feeling a bit sad" },
  { id: '7', emoji: '😡', label: "I'm feeling angry right now" },
  { id: '8', emoji: '😱', label: "That surprised me" },
  { id: '9', emoji: '😴', label: "I'm feeling sleepy" },
  { id: '10', emoji: '🤢', label: "I'm feeling a little sick" },
  { id: '11', emoji: '🥳', label: "I'm excited and ready to celebrate" },
  { id: '12', emoji: '🍕', label: "I really want pizza" },
  { id: '13', emoji: '❤', label: "I love you" },
  { id: '14', emoji: '🏠', label: "I'm heading home now" },
  { id: '15', emoji: '💤', label: "I'm about to fall asleep" },

];

// ---------------------- Main App ----------------------
export default function App() {
  const [tab, setTab] = useState('emoji'); // "emoji" or "voice"
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'emoji' && styles.tabActive]}
          onPress={() => setTab('emoji')}>
          <Text style={[styles.tabText, tab === 'emoji' && styles.tabTextActive]}>
            😊 Emoji Builder
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, tab === 'voice' && styles.tabActive]}
          onPress={() => setTab('voice')}>
          <Text style={[styles.tabText, tab === 'voice' && styles.tabTextActive]}>
            🎤 Conversation
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'emoji' ? <EmojiBuilder /> : <ConversationScreen />}
    </SafeAreaView>
  );
}

// ---------------------- Emoji Emotion Sentence Builder ----------------------
function EmojiBuilder() {
  const [selectedEmojis, setSelectedEmojis] = useState([]);
  const scale = useRef(new Animated.Value(1)).current;

  function onSelect(item) {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    scale.setValue(0.8);
    Animated.spring(scale, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
    setSelectedEmojis((prev) => [...prev, item]);
    Speech.stop();
    Speech.speak(item.label, { language: 'en', pitch: 1.1 });
  }

  function speakSentence() {
    const sentence = selectedEmojis.map((e) => e.label).join(' ');
    Speech.stop();
    Speech.speak(sentence || 'Please select emojis first', { language: 'en' });
  }

  return (
    <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 10 }}>
      <Text style={styles.heading}>Emoji Emotion Sentence Builder</Text>

      <View style={styles.previewContainer}>
        <Animated.View style={[styles.bigEmojiWrap, { transform: [{ scale }] }]}>
          <Text style={styles.bigEmoji}>
            {selectedEmojis.length > 0
              ? selectedEmojis[selectedEmojis.length - 1].emoji
              : '🙂'}
          </Text>
        </Animated.View>
        <Text style={styles.previewLabel}>
          {selectedEmojis.length > 0
            ? 'Tap more emojis to build your sentence'
            : 'Tap emojis below to start'}
        </Text>
      </View>

      <View style={styles.sentenceContainer}>
        <Text style={styles.sentenceText}>
          {selectedEmojis.map((e) => e.emoji).join(' ')}
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={speakSentence} style={styles.speakButton}>
            <Text style={styles.buttonText}>🔊 Speak</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedEmojis([])} style={styles.clearButton}>
            <Text style={styles.buttonText}>🧹 Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={EMOJIS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelect(item)} style={styles.emojiButton}>
            <Text style={styles.emojiText}>{item.emoji}</Text>
          </TouchableOpacity>
        )}
        numColumns={5}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

// ---------------------- Conversation Screen (STT + TTS) ----------------------
function ConversationScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [recording, setRecording] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Tap the mic to speak');
  const [textToSpeak, setTextToSpeak] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Microphone access is required for this feature.');
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setStatusMessage('Recording...');
      setSpokenText('');
    } catch (err) {
      Alert.alert('Recording Error', 'Failed to start recording.');
    }
  };

  const stopRecordingAndTranscribe = async () => {
    setIsRecording(false);
    setStatusMessage('Transcribing...');
    setIsTranscribing(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const newPath = FileSystem.documentDirectory + 'recording.m4a';
      await FileSystem.copyAsync({ from: uri, to: newPath });
      await sendAudioForTranscription(newPath);
    } catch (err) {
      Alert.alert('Recording Error', 'Failed to stop recording.');
      setIsTranscribing(false);
    }
  };

  const sendAudioForTranscription = async (uri) => {
    const apiKey = 'AIzaSyDPFeMhI9BxfGOnxVfUas8Z_L5AhfnUiVg';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    try {
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const payload = {
        contents: [
          {
            parts: [
              { text: 'Transcribe the following audio strictly into English.' },
              { inlineData: { mimeType: 'audio/m4a', data: base64Audio } },
            ],
          },
        ],
      };
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'Transcription failed.';
      setSpokenText(text);
      setStatusMessage('Finished recording, record again');
    } catch (error) {
      Alert.alert('Error', error.message);
      setSpokenText('Transcription failed.');
    } finally {
      setIsTranscribing(false);
      setRecording(null);
    }
  };

  const handleMicPress = () => {
    isRecording ? stopRecordingAndTranscribe() : startRecording();
  };

  const speakText = async () => {
    if (textToSpeak) {
      setIsSpeaking(true);
      Speech.speak(textToSpeak, {
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  return (
    <View style={styles.voiceContainer}>
      <Text style={styles.sectionTitle}>Speech to Text</Text>
      <TouchableOpacity
        style={[styles.micButton, isRecording && styles.micButtonRecording]}
        onPress={handleMicPress}
        disabled={isTranscribing}>
        {isTranscribing ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <Ionicons name={isRecording ? 'mic' : 'mic-outline'} size={60} color="white" />
        )}
      </TouchableOpacity>
      <Text style={styles.statusText}>{statusMessage}</Text>
      <View style={styles.textBox}>
        <Text style={styles.text}>{spokenText}</Text>
      </View>

      <View style={styles.separator} />
      <Text style={styles.sectionTitle}>Text to Speech</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          onChangeText={setTextToSpeak}
          value={textToSpeak}
          placeholder="Enter text to speak..."
          placeholderTextColor="#adb5bd"
          multiline
        />
        <TouchableOpacity onPress={speakText} disabled={isSpeaking || textToSpeak.length === 0}>
          <Ionicons
            name={isSpeaking ? 'volume-high' : 'volume-high-outline'}
            size={30}
            color={isSpeaking ? '#007bff' : '#6c757d'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------- Styles ----------------------
// ---------------------- Styles ----------------------

const styles = StyleSheet.create({
  // --- GLOBAL / CONTAINER STYLES ---
  container: { 
    flex: 1, 
    backgroundColor: '#F0F4F8', // Soft light background
  },
  
  // --- TAB BAR STYLES ---
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingTop: 25, 
    backgroundColor: '#FFFFFF', // White bar
    borderBottomWidth: 0, // Removed sharp border
    // Added prominent shadow for separation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 10,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 30, // Fully rounded pill shape
  },
  tabActive: { 
    backgroundColor: '#00796B', // Primary Deep Blue-Green
    shadowColor: '#00796B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  tabText: { 
    fontSize: 15, 
    color: '#546E7A', 
    fontWeight: '500',
  },
  tabTextActive: { 
    color: '#FFFFFF', 
    fontWeight: '700',
  },

  // --- EMOJI BUILDER STYLES ---
  heading: { 
    fontSize: 24, 
    fontWeight: '800', 
    textAlign: 'center', 
    marginBottom: 20, 
    color: '#37474F', // Dark text
  },
  previewContainer: { 
    alignItems: 'center', 
    marginBottom: 25,
  },
  bigEmojiWrap: {
    width: 160,
    height: 160,
    borderRadius: 35, // Large, soft corner radius
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    // Stronger, softer shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  bigEmoji: { 
    fontSize: 80,
  },
  previewLabel: { 
    marginTop: 15, 
    fontSize: 15, 
    color: '#546E7A', 
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sentenceContainer: { 
    alignItems: 'center', 
    marginVertical: 20, 
    backgroundColor: '#FFFFFF', 
    padding: 20, 
    borderRadius: 18, // Rounded container
    borderWidth: 1,
    borderColor: '#E0E0E0',
    // Slight inner shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sentenceText: { 
    fontSize: 32, 
    textAlign: 'center', 
    marginBottom: 16, 
    fontWeight: '500', 
  },
  buttonRow: { 
    flexDirection: 'row', 
    gap: 15,
  },
  speakButton: {
    backgroundColor: '#4CAF50', // Success Green
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    // Accent shadow
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  clearButton: {
    backgroundColor: '#FF5722', // Action Orange/Red
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    // Accent shadow
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '700', 
    letterSpacing: 0.5,
  },
  row: { 
    justifyContent: 'space-around', 
    marginBottom: 12, 
    paddingHorizontal: 0, 
  },
  emojiButton: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 0, // Removed thin border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 5, // Added margin for spacing
  },
  emojiText: { 
    fontSize: 30,
  },

  // --- CONVERSATION SCREEN STYLES ---
  voiceContainer: { 
    flex: 1, 
    alignItems: 'center', 
    padding: 25,
    justifyContent: 'flex-start', // Start from the top
    paddingTop: 30, 
  },
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    marginVertical: 15, 
    color: '#37474F',
    alignSelf: 'flex-start',
    paddingLeft: 5,
  },
  micButton: {
    backgroundColor: '#00796B', // Primary Color
    borderRadius: 80,
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00796B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  micButtonRecording: { 
    backgroundColor: '#FF5722', // Alert/Recording State
    shadowColor: '#FF5722',
  },
  statusText: { 
    marginTop: 10, 
    fontSize: 16, 
    color: '#546E7A', 
    fontWeight: '600',
  },
  textBox: {
    width: '100%',
    minHeight: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 15,
    // Soft, deep shadow for main content
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  text: { 
    fontSize: 17, 
    textAlign: 'left', 
    color: '#212529',
  },
  separator: { 
    width: '100%', 
    height: 1, 
    backgroundColor: '#CFD8DC', 
    marginVertical: 25,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items at the top
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    minHeight: 80,
    fontSize: 17,
    color: '#212529',
    paddingRight: 10,
    textAlignVertical: 'top',
  },
});