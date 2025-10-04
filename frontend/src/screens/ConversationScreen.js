import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';

const ConversationScreen = () => {
  // STT State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [recording, setRecording] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Tap the mic to speak');

  // TTS State
  const [textToSpeak, setTextToSpeak] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Microphone permission on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Microphone access is required for this feature.');
      }
    })();
  }, []);

  // STT Logic
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
      console.error('Failed to start recording', err);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
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
      console.error('Failed to stop recording', err);
      Alert.alert('Recording Error', 'Failed to stop recording. Please try again.');
      setIsTranscribing(false);
    }
  };

  const sendAudioForTranscription = async (uri) => {
    const apiKey = 'Your_Gemini_API';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        Alert.alert('File Error', 'Recorded file not found.');
        setIsTranscribing(false);
        return;
      }

      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const payload = {
        contents: [
          {
            parts: [
              { text: 'Transcribe the following audio strictly into English. Return only the spoken words with no extra commentary or labels.' },
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

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      const transcribedText = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'Transcription failed.';
      setSpokenText(transcribedText);
      setStatusMessage('Finished recording, record again');
    } catch (error) {
      console.error('Transcription failed', error);
      Alert.alert('Transcription Error', `Failed to transcribe audio. Error: ${error.message}`);
      setSpokenText('Transcription failed.');
    } finally {
      setIsTranscribing(false);
      setRecording(null);
    }
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecordingAndTranscribe();
    } else {
      startRecording();
    }
  };

  const getMicIcon = () => {
    if (isTranscribing) {
      return <ActivityIndicator size="large" color="white" />;
    }
    return (
      <Ionicons name={isRecording ? 'mic' : 'mic-outline'} size={60} color="white" />
    );
  };

  // TTS Logic
  const speakText = async () => {
    if (textToSpeak) {
      setIsSpeaking(true);
      await Speech.speak(textToSpeak, {
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Speech-to-Text Section (Upper Half) */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Speech to Text</Text>
        <View style={styles.micContainer}>
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.micButtonRecording]}
            onPress={handleMicPress}
            disabled={isTranscribing}
          >
            {getMicIcon()}
          </TouchableOpacity>
          <Text style={styles.statusText}>
            {isTranscribing ? 'Transcribing...' : statusMessage}
          </Text>
        </View>
        <View style={styles.textBox}>
          <Text style={styles.text}>{spokenText}</Text>
        </View>
      </View>

      {/* --- Horizontal Separator --- */}
      <View style={styles.separator} />

      {/* Text-to-Speech Section (Lower Half) */}
      <View style={styles.sectionContainer}>
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
          <TouchableOpacity
            style={styles.speakerButton}
            onPress={speakText}
            disabled={isSpeaking || textToSpeak.length === 0}
          >
            <Ionicons
              name={isSpeaking ? 'volume-high' : 'volume-high-outline'}
              size={30}
              color={isSpeaking ? '#007bff' : '#6c757d'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sectionContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 10,
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  micButton: {
    backgroundColor: '#007bff',
    borderRadius: 60,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  micButtonRecording: {
    backgroundColor: '#dc3545',
  },
  statusText: {
    marginTop: 20,
    fontSize: 18,
    color: '#6c757d',
    fontWeight: 'bold',
  },
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
  text: {
    fontSize: 18,
    color: '#343a40',
    textAlign: 'center',
  },
  separator: {
    width: '90%',
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 20,
  },
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
    minHeight: 100,
    fontSize: 18,
    color: '#343a40',
    paddingRight: 10,
    paddingLeft: 10,
    textAlignVertical: 'top',
  },
  speakerButton: {
    padding: 10,
  },
});

export default ConversationScreen;
