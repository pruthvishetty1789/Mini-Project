import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';


const SpeakPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');

  const handleMicPress = () => {
    // Toggle the recording state
    setIsRecording(!isRecording);

    if (!isRecording) {
      // If we are starting to record, clear previous text and simulate recording
      setSpokenText('');
      // In a real app, you would start the speech recognition service here.
      // We use a timeout to simulate a delay before the "transcription" appears.
      setTimeout(() => {
        setSpokenText('The transcribed text will appear here.');
        setIsRecording(false);
      }, 3000); // Simulates a 3-second recording and transcription time
    } else {
      // If we are stopping, you would stop the service here.
      setIsRecording(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.micContainer}>
        <TouchableOpacity 
          style={[styles.micButton, isRecording && styles.micButtonRecording]} 
          onPress={handleMicPress}
        >
          <Ionicons name={isRecording ? 'mic' : 'mic-outline'} size={60} color="white" />
        </TouchableOpacity>
        <Text style={styles.statusText}>
          {isRecording ? 'Recording...' : 'Tap the mic to speak'}
        </Text>
      </View>

      <View style={styles.textBox}>
        <Text style={styles.text}>{spokenText}</Text>
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
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
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
    minHeight: 150,
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
});

export default SpeakPage;