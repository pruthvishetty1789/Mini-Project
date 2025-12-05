import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal } from 'react-native';
import * as Speech from 'expo-speech';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useNavigation } from '@react-navigation/native';
import MatchTheFollowing from './MatchTheFollowing';
// ✅ Create a mapping of alphabets to their images
const alphabetImages = {
  a: require('../../assets/a.jpg'),
  b: require('../../assets/b.jpg'),
  c: require('../../assets/c.jpg'),
  d: require('../../assets/d.jpg'),
  e: require('../../assets/e.jpg'),
  f: require('../../assets/f.jpg'),
  g: require('../../assets/g.jpg'),
  h: require('../../assets/h.jpg'),
  i: require('../../assets/i.jpg'),
  j: require('../../assets/j.jpg'),
  k: require('../../assets/k.jpg'),
  l: require('../../assets/l.jpg'),
  m: require('../../assets/m.jpg'),
  n: require('../../assets/n.jpg'),
  o: require('../../assets/o.jpg'),
  p: require('../../assets/p.jpg'),
  q: require('../../assets/q.jpg'),
  r: require('../../assets/r.jpg'),
  s: require('../../assets/s.jpg'),
  t: require('../../assets/t.jpg'),
  u: require('../../assets/u.jpg'),
  v: require('../../assets/v.jpg'),
  w: require('../../assets/w.jpg'),
  x: require('../../assets/x.jpg'),
  y: require('../../assets/y.jpg'),
  z: require('../../assets/z.jpg'),
};

export default function Lesson1() {
  const alphabets = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const navigation = useNavigation(); // 👈 You forgot this line

  const speak = (word) => {
    Speech.speak(word, { language: 'en-IN' });
  };

  const handleImagePress = (imageSource) => {
    setViewerImages([{ url: '', props: { source: imageSource } }]);
    setIsViewerVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.lessonTitle}>Lesson 1: Alphabets</Text>

      {alphabets.map((letter, index) => (
        <View key={index} style={styles.questionContainer}>
          <Text style={styles.questionText}>{letter}</Text>

          <TouchableOpacity onPress={() => handleImagePress(alphabetImages[letter.toLowerCase()])}>
            <Image
              source={alphabetImages[letter.toLowerCase()]}
              style={styles.signImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Text style={styles.description}>
            This sign is for the letter {letter}.
          </Text>

          <TouchableOpacity style={styles.decodeButton} onPress={() => speak(letter)}>
            <Text style={styles.buttonText}>Speak</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Fullscreen Image Viewer */}
      <Modal visible={isViewerVisible} transparent={true}>
        <ImageViewer
          imageUrls={viewerImages}
          onCancel={() => setIsViewerVisible(false)}
          enableSwipeDown={true}
        />
      </Modal>

      {/* 🔹 Navigate to Match the Following */}
      <TouchableOpacity
        style={[styles.decodeButton, { backgroundColor: '#f39c12', marginBottom: 40 }]}
        onPress={() => navigation.navigate('MatchTheFollowing')}
      >
        <Text style={styles.buttonText}>Play Match the Following</Text>
      </TouchableOpacity>
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
