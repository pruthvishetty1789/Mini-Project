import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const center = width / 2;
const radius = width * 0.35;

export default function HomeScreen({ navigation }) {

  const lessons = [
    { id: 1, title: "Lesson 1", screen: "Lesson1" },
    { id: 2, title: "Lesson 2", screen: "Lesson2" },
    { id: 3, title: "Lesson 3", screen: "Lesson3" },
    { id: 4, title: "Lesson 4", screen: "Lesson4" },
    { id: 5, title: "Lesson 5", screen: "Lesson5" },
  ];

  return (
    <View style={styles.container}>
      
      {/* Central circular logo */}
      <View style={styles.centerLogoContainer}>
        <Text style={styles.appTitle}>Learning Sign Languages</Text>
        
      </View>

      {/* Lesson buttons arranged in a circle */}
      {lessons.map((lesson, index) => {
        const angle = (index / lessons.length) * 2 * Math.PI - Math.PI / 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        return (
          <TouchableOpacity
            key={lesson.id}
            style={[styles.button, {
              left: center + x - 40, // half of button width
              top: height / 2 + y - 40,
            }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(lesson.screen)}
          >
            <Text style={styles.buttonText}>{lesson.title}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  centerLogoContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: height * 0.05,
  },
  
  logo: {
    width: 100,
    height: 100,
  },
  appTitle: {
    marginTop: 5,
    fontSize: 22,
    fontWeight: "bold",
    color: "#628ec8ff",
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#718be0ff",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
});
