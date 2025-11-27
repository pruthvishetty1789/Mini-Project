import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import * as Speech from 'expo-speech';
import ImageViewer from 'react-native-image-zoom-viewer';

export default function Lesson2({ navigation }) {
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);

  const speak = (word) => {
    Speech.speak(word, { language: 'en-IN' });
  };

  const handleImagePress = (imageSource) => {
    // The library requires an array of objects with a 'url' key.
    // For local images, you can pass the require path via props.
    setViewerImages([{ url: '', props: { source: imageSource } }]);
    setIsViewerVisible(true);
  };

  const signs = [
    {
      label: 'Hello',
      image: require('../../assets/hello.jpg'),
      zoomImage: require('../../assets/hello.jpg'),
      description:
        'This sign is a universal greeting used to say "hello" or "hi" to someone.',
      speech: 'Hello',
    },
    {
      label: 'Please',
      image: require('../../assets/please.jpg'),
      zoomImage: require('../../assets/please.jpg'),
      description: 'The sign for "please" is a polite way to make a request.',
      speech: 'Please',
    },
    {
      label: 'Sorry',
      image: require('../../assets/sorry.jpg'),
      zoomImage: require('../../assets/sorry.jpg'),
      description: 'This sign is used to apologize for a mistake.',
      speech: 'Sorry',
    },
    {
      label: 'Yes',
      image: require('../../assets/yes.jpg'),
      zoomImage: require('../../assets/yes.jpg'),
      description: 'This sign indicates an affirmative response.',
      speech: 'Yes',
    },
    {
      label: 'No',
      image: require('../../assets/no.jpg'),
      zoomImage: require('../../assets/no.jpg'),
      description: 'This sign is a common way to give a negative response.',
      speech: 'No',
    },
    {
      label: 'Thank You',
      image: require('../../assets/thanku.jpg'),
      zoomImage: require('../../assets/thanku.jpg'),
      description: 'This sign is used to express gratitude.',
      speech: 'Thank You',
    },
    {
      label: 'I Love You',
      image: require('../../assets/iloveu.jpg'),
      zoomImage: require('../../assets/iloveu.jpg'),
      description: 'This sign is used to express love and affection.',
      speech: 'I Love You',
    },
    {
      label: 'House',
      image: require('../../assets/house.jpg'),
      zoomImage: require('../../assets/house.jpg'),
      description: 'This sign represents a house or home.',
      speech: 'House',
    },
    {
      label: 'Family',
      image: require('../../assets/family.jpg'),
      zoomImage: require('../../assets/family.jpg'),
      description: 'This sign represents family or relatives.',
      speech: 'Family',
    },
    {
      label: 'Love',
      image: require('../../assets/love.jpg'),
      zoomImage: require('../../assets/love.jpg'),
      description: 'This sign represents love or affection.',
      speech: 'Love',
    },
    {
      label: 'Bye',
      image: require('../../assets/bye.jpg'),
      zoomImage: require('../../assets/bye.jpg'),
      description: 'This sign is used to say goodbye.',
      speech: 'Bye',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.lessonTitle}>Lesson 2: Basic Signs</Text>

      {signs.map((sign, index) => (
        <View key={index} style={styles.questionContainer}>
          <Text style={styles.questionText}>{sign.label}</Text>
          <TouchableOpacity onPress={() => handleImagePress(sign.zoomImage)}>
            <Image
              source={sign.image}
              style={styles.signImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.description}>{sign.description}</Text>
          <TouchableOpacity
            style={styles.decodeButton}
            onPress={() => speak(sign.speech)}
          >
            <Text style={styles.buttonText}>Speak</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Start Quiz Button */}
      <TouchableOpacity
        style={styles.quizButton}
        onPress={() => navigation.navigate('Lesson2Quiz')}
      >
        <Text style={styles.quizButtonText}>Start Lesson 2 Quiz</Text>
      </TouchableOpacity>

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
  quizButton: {
    marginTop: 10,
    marginBottom: 40,
    backgroundColor: '#6c5ce7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  quizButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});

