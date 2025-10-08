import React,{useState} from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity,Modal } from 'react-native';
import * as Speech from 'expo-speech'; // Import the library
import ImageViewer from 'react-native-image-zoom-viewer';
export default function Lesson4() {
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

  const signs = [
    {
      label:'Help',
  image: require('../../assets/help.jpg'),
  zoomImage: require('../../assets/help.jpg'),
  description: 'This sign represents help',
  speech: 'Help',
    },
  {
    label:'Fire',
  image: require('../../assets/fire.jpg'),
  zoomImage: require('../../assets/fire.jpg'),
  description: 'This sign represents fire',
  speech: 'Fire',
  },
{
  label:'Police',
  image: require('../../assets/police.jpg'),
  zoomImage: require('../../assets/police.jpg'),  
  description: 'This sign represents police',
  speech: 'Police',
},
{
  label:'Danger',
  image: require('../../assets/danger.jpg'),
  zoomImage: require('../../assets/danger.jpg'),
  description: 'This sign represents danger',
  speech: 'Danger',
},
{label:'Stop',
  image: require('../../assets/stop.jpg'),
  zoomImage: require('../../assets/stop.jpg'),
  description: 'This sign represents stop',
  speech: 'Stop',
},{
  label:'Emergency',
  image: require('../../assets/emergency.jpg'),
  zoomImage: require('../../assets/emergency.jpg'),
  description: 'This sign represents emergency',
  speech: 'Emergency',
}]
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.lessonTitle}>Lesson 4: Emergency or Safety Signs</Text>
    
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
        <TouchableOpacity style={styles.decodeButton} onPress={() => speak(sign.speech)}>
          <Text style={styles.buttonText}>Speak</Text>
        </TouchableOpacity>
      </View>
    ))}
    
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