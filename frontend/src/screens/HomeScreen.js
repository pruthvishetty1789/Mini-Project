import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Easing,
  ScrollView // Using ScrollView for better layout management
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

// Define responsive sizes
const LOGO_SIZE = width * 0.35;
const LESSON_CARD_WIDTH = width * 0.85;

export default function HomeScreen() {
  const navigation = useNavigation();
  const logoAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  // Float animation for logo
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnim, { toValue: -8, duration: 1800, useNativeDriver: true, easing: Easing.easeInOut }),
        Animated.timing(logoAnim, { toValue: 0, duration: 1800, useNativeDriver: true, easing: Easing.easeInOut }),
      ])
    ).start();

    // Fade-in animation for the lesson list
    Animated.timing(listAnim, {
      toValue: 1,
      duration: 800,
      delay: 300,
      useNativeDriver: true,
    }).start();

  }, [logoAnim, listAnim]);

  const lessons = [
    { id: 1, title: "Alphabets", screen: "Lesson1", description: "Start your journey with essential vocabulary." },
    { id: 2, title: "Basic Signs", screen: "Lesson2", description: "Learn how to express actions and time." },
    { id: 3, title: "Family", screen: "Lesson3", description: "Master common conversational phrases." },
    { id: 4, title: "Emergency or Safety Signs", screen: "Lesson4", description: "Real-world scenarios and pronunciation tips." },
    { id: 5, title: "Simple Sentences", screen: "Lesson5", description: "Test your knowledge and track your progress." },
   
  ];

  const renderLessonCard = (lesson) => {
    return (
      <TouchableOpacity
        key={lesson.id}
        activeOpacity={0.8}
        style={styles.lessonCard}
        onPress={() => navigation.navigate(lesson.screen)}
      >
        <LinearGradient
            colors={['#fff', '#f0f4f8']} // Slight gradient for depth
            style={styles.cardGradient}
        >
            <View style={styles.cardContent}>
                <View style={styles.cardIconContainer}>
                    <Text style={styles.cardLessonNumber}>{lesson.id}</Text>
                </View>
                <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle}>{lesson.title}</Text>
                    <Text style={styles.cardDescription} numberOfLines={1}>{lesson.description}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={28} color="#999" />
            </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Language Hub</Text>
          <Text style={styles.subTitle}>Select your next module to continue your progress.</Text>
        </View>

        {/* Central character/logo */}
        <Animated.View
          style={[
            styles.centerLogoContainer,
            { transform: [{ translateY: logoAnim }] },
          ]}
        >
          <Image
            source={require("../../assets/home1.jpg")}
            style={styles.logo}
          />
        </Animated.View>

        {/* Lesson List */}
        <Animated.View style={[styles.lessonListContainer, { opacity: listAnim, transform: [{ translateY: listAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <Text style={styles.listHeader}>Available Lessons</Text>
          {lessons.map(renderLessonCard)}
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // --- Global Style Variables ---
  baseColor: '#f0f4f8', // Light background
  primaryColor: '#4A90E2', // Blue
  shadowLight: 'rgba(255, 255, 255, 0.9)',
  shadowDark: 'rgba(174, 174, 192, 0.4)',

  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },

  // --- Header ---
  header: {
    width: '100%',
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: width * 0.08,
    fontWeight: "900",
    color: "#333",
  },
  subTitle: {
    fontSize: width * 0.04,
    color: "#777",
    textAlign: 'center',
    marginTop: 5,
  },

  // --- Central Logo/Character ---
  centerLogoContainer: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: '#f0f4f8',
    justifyContent: "center",
    alignItems: "center",
    // Neumorphism style shadow for the logo container
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 30,
    // Optional second light shadow for depth
    // borderTopWidth: 1, 
    // borderLeftWidth: 1,
    // borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  logo: {
    width: LOGO_SIZE * 0.8,
    height: LOGO_SIZE * 0.8,
    borderRadius: (LOGO_SIZE * 0.8) / 2,
  },

  // --- Lesson List ---
  lessonListContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  listHeader: {
    fontSize: width * 0.05,
    fontWeight: '700',
    color: '#4A90E2',
    alignSelf: 'flex-start',
    marginLeft: 25,
    marginBottom: 15,
  },

  // --- Lesson Card (UPDATED) ---
  lessonCard: {
    width: LESSON_CARD_WIDTH,
    height: 90,
    borderRadius: 18,
    marginBottom: 15,
    // Neumorphism card shadow
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    justifyContent: 'space-between',
  },
  cardIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    // Inset-like shadow for number container
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    marginRight: 15,
  },
  cardLessonNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 12,
    color: '#777',
  },
});