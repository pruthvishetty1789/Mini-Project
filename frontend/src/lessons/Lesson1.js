import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal } from 'react-native';
import * as Speech from 'expo-speech';
import ImageViewer from 'react-native-image-zoom-viewer';

export default function Lesson1() {
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);

  const speak = (word) => {
    Speech.speak(word, { language: 'en-IN' });
  };

  const handleImagePress = (imageSource) => {
    // The library requires an array of objects with a 'url' key.
    // For local images, you need to convert the require() path to a URL format.
    // A simple way is to pass the require path itself.
    setViewerImages([{ url: '', props: { source: imageSource } }]);
    setIsViewerVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.lessonTitle}>Lesson 1: Alphabets</Text>

    
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>A</Text>
        <TouchableOpacity onPress={() => handleImagePress(require('../../assets/a.png'))}>
          <Image
            source={require('../../assets/a.png')}
            style={styles.signImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.description}>This sign is for the letter A.</Text>
        <TouchableOpacity style={styles.decodeButton} onPress={() => speak('A')}>
          <Text style={styles.buttonText}>Speak</Text>
        </TouchableOpacity>
      </View>

     
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>B</Text>
        <TouchableOpacity onPress={() => handleImagePress(require('../../assets/b.png'))}>
          <Image
            source={require('../../assets/b.png')}
            style={styles.signImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.description}>The sign for "please" is a polite way to make a request.</Text>
        <TouchableOpacity style={styles.decodeButton} onPress={() => speak('B')}>
          <Text style={styles.buttonText}>Speak</Text>
        </TouchableOpacity>
      </View>

  
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>C</Text>
        <TouchableOpacity onPress={() => handleImagePress(require('../../assets/c.png'))}>
          <Image
            source={require('../../assets/c.png')}
            style={styles.signImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.description}>This sign is used to apologize for a mistake.</Text>
        <TouchableOpacity style={styles.decodeButton} onPress={() => speak('C')}>
          <Text style={styles.buttonText}>Speak</Text>
        </TouchableOpacity>
      </View>

   
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>D</Text>
        <TouchableOpacity onPress={() => handleImagePress(require('../../assets/d.png'))}>
          <Image
            source={require('../../assets/d.png')}
            style={styles.signImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.description}>This sign indicates an affirmative response.</Text>
        <TouchableOpacity style={styles.decodeButton} onPress={() => speak('D')}>
          <Text style={styles.buttonText}>Speak</Text>
        </TouchableOpacity>
      </View>

     
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>No</Text>
        <TouchableOpacity onPress={() => handleImagePress(require('../../assets/no.jpg'))}>
          <Image
            source={require('../../assets/no.jpg')}
            style={styles.signImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.description}>This sign is a common way to give a negative response.</Text>
        <TouchableOpacity style={styles.decodeButton} onPress={() => speak('No')}>
          <Text style={styles.buttonText}>Speak</Text>
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