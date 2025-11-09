import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal } from 'react-native';
import * as Speech from 'expo-speech';
import ImageViewer from 'react-native-image-zoom-viewer';

export default function Lesson5() {
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);

  const speak = (word) => {
    Speech.speak(word, { language: 'en-IN' });
  };

  const handleImagePress = (imageSource) => {
    setViewerImages([{ url: '', props: { source: imageSource } }]);
    setIsViewerVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.lessonTitle}>Lesson 5: Simple Sentences</Text>

      {/* First phrase */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>What is your name?</Text>
        <View style={styles.imageRow}>
          <Image
            source={require('../../assets/qsn.png')}
            style={styles.signImage}
            resizeMode="contain"
          />
          <Image
            source={require('../../assets/name.png')}
            style={styles.signImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.description}>This phrase is used to ask someone's name.</Text>
        <TouchableOpacity style={styles.decodeButton} onPress={() => speak('What is your name?')}>
          <Text style={styles.buttonText}>Speak Phrase</Text>
        </TouchableOpacity>
      </View>

      {/* Second phrase */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>My name is ...</Text>
        <TouchableOpacity onPress={() => handleImagePress(require('../../assets/myname.png'))}>
          <Image
            source={require('../../assets/myname.png')}
            style={styles.signImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.description}>This phrase is used to introduce oneself.</Text>
        <TouchableOpacity style={styles.decodeButton} onPress={() => speak('My name is ... and tell your name')}>
          <Text style={styles.buttonText}>Speak Phrase</Text>
        </TouchableOpacity>
      </View>

      {/* Third phrase */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>How are you?</Text>
        <TouchableOpacity onPress={() => handleImagePress(require('../../assets/howru.jpeg'))}>
          <Image
            source={require('../../assets/howru.jpeg')}
            style={styles.signImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.description}>This phrase is used to ask someone how they are.</Text>
        <TouchableOpacity style={styles.decodeButton} onPress={() => speak('How are you?')}>
          <Text style={styles.buttonText}>Speak Phrase</Text>
        </TouchableOpacity>
      </View>

      {/* Image Viewer Modal */}
      <Modal
        visible={isViewerVisible}
        transparent={true}
        onRequestClose={() => setIsViewerVisible(false)}
      >
        <ImageViewer
          imageUrls={viewerImages}
          onSwipeDown={() => setIsViewerVisible(false)}
          enableSwipeDown
        />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  lessonTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  questionContainer: {
    marginBottom: 40,
    alignItems: 'center',
    width: '90%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#555',
  },
  signImage: {
    width: 80,
    height: 80,
    marginHorizontal: 5,
  },
  description: {
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
    color: '#777',
    lineHeight: 24,
  },
  decodeButton: {
    marginTop: 20,
    backgroundColor: '#4a90e2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
