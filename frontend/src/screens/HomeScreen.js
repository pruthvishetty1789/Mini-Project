import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";


const { width, height } = Dimensions.get("window");
const center = width / 2;
const radius = width * 0.35;

export default function HomeScreen() {
  const navigation = useNavigation();

  // Array of lesson objects with their page names
  const lessons = [
    { id: 1, title: "Lesson 1", screen: "Lesson1" },
    { id: 2, title: "Lesson 2", screen: "Lesson2" },
    { id: 3, title: "Lesson 3", screen: "Lesson3" },
    { id: 4, title: "Lesson 4", screen: "Lesson4" },
    { id: 5, title: "Lesson 5", screen: "Lesson5" },
  ];

  return (
    <View style={styles.container}>
      
      {/* Central character/logo */}
      <View style={styles.centerLogoContainer}>
        <Image
          source={require("../../assets/home.png")}
          style={styles.logo}
        />
      </View>

      {/* Lesson buttons arranged in a circle */}
      {lessons.map((lesson, index) => {
        const angle = (index / lessons.length) * 2 * Math.PI - Math.PI / 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        return (
          <TouchableOpacity
            key={lesson.id}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  centerLogoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "-25%",
    marginTop: "10%",
    width: 120,
    height: 120,
  },
  logo: {
    width: 120,
    height: 120,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#a5e1e6ff",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});