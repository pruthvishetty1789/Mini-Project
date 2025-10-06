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

  const signs = [
  {
    label: 'Father',
    image: require('../../assets/father.jpg'),
    zoomImage: require('../../assets/father.jpg'),
    description: 'This sign represents a father or dad',
    speech: 'Father',
  },
  {
    label: 'Mother',
    image: require('../../assets/mother.jpg'),
    zoomImage: require('../../assets/mother.jpg'),
    description: 'This sign represents a mother or mom',
    speech: 'Mother',
  },
  {
    label: 'Brother',   
    image: require('../../assets/brother.jpg'),
    zoomImage: require('../../assets/brother.jpg'),
    description: 'This sign represents a brother or male sibling',
    speech: 'Brother',
  },
  {
    label: 'Sister', 
    image: require('../../assets/sister.jpg'),
    zoomImage: require('../../assets/sister.jpg'),
    description: 'This sign represents a sister or female sibling',
    speech: 'Sister',
  },
{
  label:'Grandfather',
  image: require('../../assets/grandpa.jpg'),
  zoomImage: require('../../assets/grandpa.jpg'),
  description: 'This sign represents a grandfather',
  speech: 'Grandfather',
},
{  label:'Grandmother',
  image: require('../../assets/grandma.jpg'),
  zoomImage: require('../../assets/grandma.jpg'),
  description: 'This sign represents a grandmother',
  speech: 'Grandmother',
}
,{
  label:'Uncle',
  image: require('../../assets/uncle.jpg'),
  zoomImage: require('../../assets/uncle.jpg'),
  description: 'This sign represents an uncle', 
  speech: 'Uncle',    
},{
  label:'Aunt',
  image: require('../../assets/aunt.jpg'),
  zoomImage: require('../../assets/aunt.jpg'),
  description: 'This sign represents an aunt',
  speech: 'Aunt',
}
]


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.lessonTitle}>Lesson 3: Family</Text>
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