import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");
const center = width / 2;
const radius = width * 0.35;

export default function HomeScreen() {
  const navigation = useNavigation();
  const logoAnim = useRef(new Animated.Value(0)).current;

  // Float animation for logo
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnim, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(logoAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [logoAnim]);

  const lessons = [
    { id: 1, title: "Lesson 1", screen: "Lesson1" },
    { id: 2, title: "Lesson 2", screen: "Lesson2" },
    { id: 3, title: "Lesson 3", screen: "Lesson3" },
    { id: 4, title: "Lesson 4", screen: "Lesson4" },
    { id: 5, title: "Lesson 5", screen: "Lesson5" },
  ];

  return (
    <LinearGradient colors={["#fdfbfb", "#ebedee"]} style={styles.container}>
      {/* Central character/logo */}
      <Animated.View
        style={[
          styles.centerLogoContainer,
          {
            transform: [{ translateY: logoAnim }],
          },
        ]}
      >
        <Image
          source={require("../../assets/home.png")}
          style={styles.logo}
        />
      </Animated.View>

      {/* Lesson buttons arranged in a circle */}
      {lessons.map((lesson, index) => {
        const angle = (index / lessons.length) * 2 * Math.PI - Math.PI / 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        return (
          <TouchableOpacity
            key={lesson.id}
            activeOpacity={0.7}
            style={[
              styles.button,
              {
                left: center + x - styles.button.width / 2,
                top: height / 2 + y - styles.button.height / 2,
              },
            ]}
            onPress={() => navigation.navigate(lesson.screen)}
          >
            <Text style={styles.buttonText}>{lesson.title}</Text>
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerLogoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "-25%",
    marginTop: "10%",
    width: 130,
    height: 130,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 8,
    backgroundColor: "#fff",
    borderRadius: 65,
  },
  logo: {
    width: 120,
    height: 120,
  },
  button: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: "#a5e1e6ff",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
  },
});
