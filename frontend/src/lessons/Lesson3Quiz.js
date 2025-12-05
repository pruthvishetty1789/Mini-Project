// src/lessons/Lesson3Quiz.js

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
    label: 'Father',
    image: require('../../assets/father.jpg'),
    description: 'This sign represents a father or dad.',
    speech: 'Father',
  },
  {
    label: 'Mother',
    image: require('../../assets/mother.jpg'),
    description: 'This sign represents a mother or mom.',
    speech: 'Mother',
  },
  {
    label: 'Brother',
    image: require('../../assets/brother.jpg'),
    description: 'This sign represents a brother or male sibling.',
    speech: 'Brother',
  },
  {
    label: 'Sister',
    image: require('../../assets/sister.jpg'),
    description: 'This sign represents a sister or female sibling.',
    speech: 'Sister',
  },
  {
    label: 'Grandfather',
    image: require('../../assets/grandpa.jpg'),
    description: 'This sign represents a grandfather.',
    speech: 'Grandfather',
  },
  {
    label: 'Grandmother',
    image: require('../../assets/grandma.jpg'),
    description: 'This sign represents a grandmother.',
    speech: 'Grandmother',
  },
  {
    label: 'Uncle',
    image: require('../../assets/uncle.jpg'),
    description: 'This sign represents an uncle.',
    speech: 'Uncle',
  },
  {
    label: 'Aunt',
    image: require('../../assets/aunt.jpg'),
    description: 'This sign represents an aunt.',
    speech: 'Aunt',
  },
];

// helper to shuffle array (simple)
const shuffleArray = (arr) => {
  return [...arr].sort(() => 0.5 - Math.random());
};

// create questions with 3 image options each
const createQuestions = () => {
  return SIGNS.map((sign, index) => {
    const others = SIGNS.filter((_, i) => i !== index);
    const distractors = shuffleArray(others).slice(0, 2);
    const options = shuffleArray([sign, ...distractors]);
    return {
      target: sign,
      options,
    };
  });
};

const QUESTIONS = createQuestions();

export default function Lesson3Quiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [feedback, setFeedback] = useState('');

  const currentQuestion = QUESTIONS[currentIndex];
  const { target, options } = currentQuestion;

  const speak = (text) => {
    Speech.speak(text, { language: 'en-IN' });
  };

  const handlePlayWord = () => {
    speak(target.speech);
  };

  const handleOptionPress = (option) => {
    setSelectedLabel(option.label);
    if (option.label === target.label) {
      setFeedback(`✅ Correct! This is "${target.label}".`);
      speak(`Correct! This is ${target.speech}.`);
    } else {
      setFeedback('❌ Not quite. Try again.');
      speak('Try again.');
    }
  };

  const handleNext = () => {
    const next = (currentIndex + 1) % QUESTIONS.length;
    setCurrentIndex(next);
    setSelectedLabel(null);
    setFeedback('');
  };

  const handlePrev = () => {
    const prev = (currentIndex - 1 + QUESTIONS.length) % QUESTIONS.length;
    setCurrentIndex(prev);
    setSelectedLabel(null);
    setFeedback('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Lesson 3 – Family Quiz</Text>
      <Text style={styles.subtitle}>
        Listen to the word and tap the correct family sign.
      </Text>

      <View style={styles.card}>
        <Text style={styles.promptText}>
          🔊 Tap the button to hear the word, then choose the correct sign.
        </Text>

        <TouchableOpacity style={styles.playButton} onPress={handlePlayWord}>
          <Text style={styles.playButtonText}>Play Word 🔊</Text>
        </TouchableOpacity>

        <Text style={styles.targetHint}>
          (Hint: This is a family member sign)
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option, idx) => {
          const isSelected = selectedLabel === option.label;
          const isCorrect =
            isSelected && option.label === target.label;
          const isWrong =
            isSelected && option.label !== target.label;

          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.optionCard,
                isSelected && styles.optionSelected,
                isCorrect && styles.optionCorrect,
                isWrong && styles.optionWrong,
              ]}
              onPress={() => handleOptionPress(option)}
            >
              <Image
                source={option.image}
                style={styles.optionImage}
                resizeMode="contain"
              />
              <Text style={styles.optionLabel}>Tap to choose</Text>
            </TouchableOpacity>
          );
        })}
      </View>

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

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.navButton, styles.secondary]}
          onPress={handlePrev}
        >
          <Text style={styles.secondaryText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.primary]}
          onPress={handleNext}
        >
          <Text style={styles.primaryText}>Next</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.progressText}>
        Question {currentIndex + 1} of {QUESTIONS.length}
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
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 18,
  },
  promptText: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    marginBottom: 10,
  },
  playButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginBottom: 6,
  },
  playButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  targetHint: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
  },

  optionsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  optionCard: {
    width: '42%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    elevation: 2,
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
  optionImage: {
    width: 80,
    height: 80,
    marginBottom: 6,
  },
  optionLabel: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
  },

  feedbackText: {
    marginTop: 6,
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
    marginTop: 10,
    marginBottom: 10,
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