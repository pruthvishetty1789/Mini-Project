// src/lessons/Lesson5Quiz.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';

const practiceQuestions = [
  {
    prompt: 'Someone asks you: "What is your name?" What should you reply?',
    options: ['How are you?', 'My name is ...', 'What is your name?'],
    correct: 'My name is ...',
    promptSpeech: 'Someone asks you, what is your name. What should you reply?',
  },
  {
    prompt: 'You want to ask a new friend about their name. Which sentence is correct?',
    options: ['My name is ...', 'How are you?', 'What is your name?'],
    correct: 'What is your name?',
    promptSpeech: 'You want to ask a new friend about their name. Which sentence is correct?',
  },
  {
    prompt: 'Your friend asks "How are you?" Which sentence is a good reply?',
    options: ['I am fine, thank you.', 'What is your name?', 'My name is ...'],
    correct: 'I am fine, thank you.',
    promptSpeech: 'Your friend asks, how are you. Which sentence is a good reply?',
  },
];

export default function Lesson5Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState('');

  const currentPractice = practiceQuestions[currentQuestionIndex];

  const speak = (text) => {
    Speech.speak(text, { language: 'en-IN' });
  };

  const handlePlayPrompt = () => {
    speak(currentPractice.promptSpeech);
  };

  const handleOptionPress = (option) => {
    setSelectedOption(option);
    if (option === currentPractice.correct) {
      setFeedback('✅ Correct! Well done.');
      speak('Correct! Well done.');
    } else {
      setFeedback('❌ Not quite. Try again.');
      speak('Not quite. Try again.');
    }
  };

  const handleNextPractice = () => {
    const next = (currentQuestionIndex + 1) % practiceQuestions.length;
    setCurrentQuestionIndex(next);
    setSelectedOption(null);
    setFeedback('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Lesson 5 – Conversation Quiz</Text>
      <Text style={styles.subtitle}>
        Read or listen to the situation and choose the best sentence.
      </Text>

      <View style={styles.card}>
        <Text style={styles.promptText}>{currentPractice.prompt}</Text>

        <TouchableOpacity style={styles.playPromptButton} onPress={handlePlayPrompt}>
          <Text style={styles.playPromptText}>Play Prompt 🔊</Text>
        </TouchableOpacity>

        {currentPractice.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const isCorrect = isSelected && option === currentPractice.correct;
          const isWrong = isSelected && option !== currentPractice.correct;

          return (
            <TouchableOpacity
              key={index}
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
              feedback.startsWith('✅') ? styles.feedbackCorrect : styles.feedbackWrong,
            ]}
          >
            {feedback}
          </Text>
        ) : null}

        <TouchableOpacity style={styles.nextButton} onPress={handleNextPractice}>
          <Text style={styles.nextButtonText}>Next Question</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.progressText}>
        Question {currentQuestionIndex + 1} of {practiceQuestions.length}
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
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 16,
  },
  promptText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 10,
    textAlign: 'center',
  },
  playPromptButton: {
    alignSelf: 'center',
    backgroundColor: '#4a90e2',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 22,
    marginBottom: 12,
  },
  playPromptText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
  nextButton: {
    marginTop: 12,
    alignSelf: 'center',
    backgroundColor: '#6c5ce7',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 22,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  progressText: {
    marginTop: 6,
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
  },
});
