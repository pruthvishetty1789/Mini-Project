// src/screens/Lesson2Quiz.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as Speech from 'expo-speech';

const SIGNS = [
  {
    label: 'Hello',
    image: require('../../assets/hello.jpg'),
    description:
      'This sign is a universal greeting used to say "hello" or "hi" to someone.',
    speech: 'Hello',
    options: ['Hello', 'Sorry', 'Bye'],
  },
  {
    label: 'Please',
    image: require('../../assets/please.jpg'),
    description: 'The sign for "please" is a polite way to make a request.',
    speech: 'Please',
    options: ['Thank You', 'Please', 'No'],
  },
  {
    label: 'Sorry',
    image: require('../../assets/sorry.jpg'),
    description: 'This sign is used to apologize for a mistake.',
    speech: 'Sorry',
    options: ['Yes', 'Sorry', 'Love'],
  },
  {
    label: 'Yes',
    image: require('../../assets/yes.jpg'),
    description: 'This sign indicates an affirmative response.',
    speech: 'Yes',
    options: ['Yes', 'No', 'Bye'],
  },
  {
    label: 'No',
    image: require('../../assets/no.jpg'),
    description: 'This sign is a common way to give a negative response.',
    speech: 'No',
    options: ['Love', 'No', 'Family'],
  },
  {
    label: 'Thank You',
    image: require('../../assets/thanku.jpg'),
    description: 'This sign is used to express gratitude.',
    speech: 'Thank You',
    options: ['Thank You', 'Hello', 'House'],
  },
  {
    label: 'I Love You',
    image: require('../../assets/iloveu.jpg'),
    description: 'This sign is used to express love and affection.',
    speech: 'I Love You',
    options: ['I Love You', 'Bye', 'Family'],
  },
  {
    label: 'House',
    image: require('../../assets/house.jpg'),
    description: 'This sign represents a house or home.',
    speech: 'House',
    options: ['House', 'Love', 'Yes'],
  },
  {
    label: 'Family',
    image: require('../../assets/family.jpg'),
    description: 'This sign represents family or relatives.',
    speech: 'Family',
    options: ['Family', 'Sorry', 'Thank You'],
  },
  {
    label: 'Love',
    image: require('../../assets/love.jpg'),
    description: 'This sign represents love or affection.',
    speech: 'Love',
    options: ['Love', 'No', 'Please'],
  },
  {
    label: 'Bye',
    image: require('../../assets/bye.jpg'),
    description: 'This sign is used to say goodbye.',
    speech: 'Bye',
    options: ['Hello', 'Bye', 'Yes'],
  },
];

export default function Lesson2Quiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState('');

  const currentSign = SIGNS[currentIndex];

  const speak = (text) => {
    Speech.speak(text, { language: 'en-IN' });
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    speak(currentSign.speech);
  };

  const handleNext = () => {
    const next = (currentIndex + 1) % SIGNS.length;
    setCurrentIndex(next);
    setShowAnswer(false);
    setSelectedOption(null);
    setFeedback('');
  };

  const handlePrev = () => {
    const prev = (currentIndex - 1 + SIGNS.length) % SIGNS.length;
    setCurrentIndex(prev);
    setShowAnswer(false);
    setSelectedOption(null);
    setFeedback('');
  };

  const handleOptionPress = (option) => {
    setSelectedOption(option);
    if (option === currentSign.label) {
      setShowAnswer(true);
      setFeedback(`✅ Correct! This sign means "${currentSign.label}".`);
      speak(`Correct! This sign means ${currentSign.speech}`);
    } else {
      setFeedback('❌ Not quite. Try again.');
      speak('Try again');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Lesson 2 – Flashcard Quiz</Text>
      <Text style={styles.subtitle}>
        Look at the sign and choose the correct meaning.
      </Text>

      <View style={styles.card}>
        <Image
          source={currentSign.image}
          style={styles.signImage}
          resizeMode="contain"
        />

        {showAnswer ? (
          <>
            <Text style={styles.labelText}>{currentSign.label}</Text>
            <Text style={styles.description}>{currentSign.description}</Text>
          </>
        ) : (
          <Text style={styles.hintText}>
            Can you guess the meaning of this sign?
          </Text>
        )}
      </View>

      {/* 🔹 Options to guess */}
      <View style={styles.optionsContainer}>
        <Text style={styles.optionsTitle}>Choose the correct meaning:</Text>
        {currentSign.options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isCorrect =
            isSelected && option === currentSign.label;
          const isWrong =
            isSelected && option !== currentSign.label;

          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.optionButton,
                isSelected && styles.optionSelected,
                isCorrect && styles.optionCorrect,
                isWrong && styles.optionWrong,
              ]}
              onPress={() => handleOptionPress(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}

        {feedback ? (
          <Text
            style={[
              styles.feedbackText,
              feedback.startsWith('✅')
                ? styles.feedbackCorrect
                : styles.feedbackWrong,
            ]}
          >
            {feedback}
          </Text>
        ) : null}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.navButton, styles.secondary]}
          onPress={handlePrev}
        >
          <Text style={styles.secondaryText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.primary]}
          onPress={handleShowAnswer}
        >
          <Text style={styles.primaryText}>
            {showAnswer ? 'Hear Again 🔊' : 'Show Answer'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.secondary]}
          onPress={handleNext}
        >
          <Text style={styles.secondaryText}>Next</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.progressText}>
        Card {currentIndex + 1} of {SIGNS.length}
      </Text>
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 18,
  },
  signImage: {
    width: 130,
    height: 130,
    marginBottom: 12,
  },
  labelText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  hintText: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 10,
  },

  // 🔹 options styles
  optionsContainer: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#4a90e2',
    backgroundColor: '#e6f0ff',
  },
  optionCorrect: {
    borderColor: '#22c55e',
    backgroundColor: '#dcfce7',
  },
  optionWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
  },
  feedbackText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  feedbackCorrect: {
    color: '#16a34a',
  },
  feedbackWrong: {
    color: '#dc2626',
  },

  buttonRow: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  navButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 24,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#4a90e2',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  secondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dfe6e9',
  },
  secondaryText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 14,
  },
  progressText: {
    marginTop: 6,
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
  },
});
