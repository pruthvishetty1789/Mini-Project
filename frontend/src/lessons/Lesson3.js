import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal } from 'react-native';
import * as Speech from 'expo-speech';
import ImageViewer from 'react-native-image-zoom-viewer';

export default function Lesson3() {
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
      <Text style={styles.lessonTitle}>Lesson 3: Common Phrases</Text>

      {/* Phrase 1: "I am hungry" */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>I am hungry</Text>
        
        {/* This single View now contains all three images */}
        <View style={styles.imageRow}>
          {/* Sign for "I" */}
          <TouchableOpacity onPress={() => handleImagePress(require('../../assets/a.png'))}>
            <Image
              source={require('../../assets/a.png')}
              style={styles.signImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Sign for "am" */}
          <TouchableOpacity onPress={() => handleImagePress(require('../../assets/b.png'))}>
            <Image
              source={require('../../assets/b.png')}
              style={styles.signImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Sign for "hungry" */}
          <TouchableOpacity onPress={() => handleImagePress(require('../../assets/c.png'))}>
            <Image
              source={require('../../assets/c.png')}
              style={styles.signImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.description}>This phrase is used to express that you are hungry.</Text>
        <TouchableOpacity style={styles.decodeButton} onPress={() => speak('I am hungry')}>
          <Text style={styles.buttonText}>Speak Phrase</Text>
        </TouchableOpacity>
      </View>

      {/* The Modal for the Image Viewer */}
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