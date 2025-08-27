import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech'; // Import the library

export default function Lesson1() {

  const speak = (word) => {
    Speech.speak(word, { language: 'en-IN' }); // 'en-IN' is for Indian English
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.lessonTitle}>Lesson 1: Basic Introductions</Text>

      {/* Question 1: Hello */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>Hello</Text>
        <Image
          source={require('../../assets/hello.jpg')}
          style={styles.signImage}
          resizeMode="contain"
        />
        <Text style={styles.description}>This sign is a universal greeting.</Text>
        <TouchableOpacity style={styles.decodeButton} onPress={() => speak('Hello')}>
          <Text style={styles.buttonText}>Speak</Text>
        </TouchableOpacity>
      </View>

      {/* Question 2: Please */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>Please</Text>
        <Image
          source={require('../../assets/please.jpg')}
          style={styles.signImage}
          resizeMode="contain"
        />
        <Text style={styles.description}>The sign for "please" is a polite way to make a request.</Text>
        <TouchableOpacity style={styles.decodeButton} onPress={() => speak('Please')}>
          <Text style={styles.buttonText}>Speak</Text>
        </TouchableOpacity>
      </View>
      {/* Question 3 */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>Sorry</Text>
        <Image
          source={require('../../assets/sorry.jpg')}
          style={styles.signImage}
          resizeMode="contain"
        />
        <Text style={styles.description}>This sign is used to apologize for a mistake.</Text>
        <TouchableOpacity style={styles.decodeButton} onPress={() => speak('Sorry')}>
          <Text style={styles.buttonText}>Speak</Text>
        </TouchableOpacity>
      </View>
       {/* Question 4 */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>Yes</Text>
        <Image
          source={require('../../assets/yes.jpg')}
          style={styles.signImage}
          resizeMode="contain"
        />
        <Text style={styles.description}>This sign indicates an affirmative response.</Text>
        <TouchableOpacity style={styles.decodeButton} onPress={() => speak('Yes')}>
          <Text style={styles.buttonText}>Speak</Text>
        </TouchableOpacity>
      </View>
       {/* Question 5 */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>No</Text>
        <Image
          source={require('../../assets/no.jpg')}
          style={styles.signImage}
          resizeMode="contain"
        />
        <Text style={styles.description}>This sign is a common way to give a negative response.</Text>
        <TouchableOpacity style={styles.decodeButton} onPress={() => speak('No')}>
          <Text style={styles.buttonText}>Speak</Text>
        </TouchableOpacity>
      </View>
      {/* ... continue for other words ... */}

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