// App.js
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
    const apiKey = 'YOUR_API_KEY_HERE';
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
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#f1f3f5',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  tabActive: { backgroundColor: '#007bff' },
  tabText: { fontSize: 16, color: '#555' },
  tabTextActive: { color: '#fff', fontWeight: '700' },

  heading: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  previewContainer: { alignItems: 'center', marginBottom: 18 },
  bigEmojiWrap: {
    width: 140,
    height: 140,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
  },
  bigEmoji: { fontSize: 72 },
  previewLabel: { marginTop: 10, fontSize: 16, color: '#444' },
  sentenceContainer: { alignItems: 'center', marginVertical: 20 },
  sentenceText: { fontSize: 28, textAlign: 'center', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  speakButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  clearButton: {
    backgroundColor: '#F44336',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  row: { justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 6 },
  emojiButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  emojiText: { fontSize: 28 },

  // Conversation Styles
  voiceContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  micButton: {
    backgroundColor: '#007bff',
    borderRadius: 60,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonRecording: { backgroundColor: '#dc3545' },
  statusText: { marginTop: 20, fontSize: 18, color: '#6c757d', fontWeight: 'bold' },
  textBox: {
    width: '90%',
    minHeight: 100,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: { fontSize: 18, textAlign: 'center', color: '#343a40' },
  separator: { width: '90%', height: 1, backgroundColor: '#e9ecef', marginVertical: 20 },
  inputContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 80,
    fontSize: 18,
    color: '#343a40',
    paddingRight: 10,
    textAlignVertical: 'top',
  },
});
