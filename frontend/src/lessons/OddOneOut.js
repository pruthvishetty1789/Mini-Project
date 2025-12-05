import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Audio } from "expo-av";   // <-- ADD THIS
import { useNavigation } from "@react-navigation/native";

export default function OddOneOut() {
  const navigation = useNavigation();

  const emergencySigns = [
    { label: "Help", image: require("../../assets/help.jpg") },
    { label: "Fire", image: require("../../assets/fire.jpg") },
    { label: "Police", image: require("../../assets/police.jpg") },
    { label: "Danger", image: require("../../assets/danger.jpg") },
    { label: "Stop", image: require("../../assets/stop.jpg") },
    { label: "Emergency", image: require("../../assets/emergency.jpg") },
  ];

  const nonEmergency = [
    { label: "Mother", image: require("../../assets/mother.jpg") },
    { label: "Father", image: require("../../assets/father.jpg") },
    { label: "Brother", image: require("../../assets/brother.jpg") },
    { label: "Sister", image: require("../../assets/sister.jpg") },
    { label: "Uncle", image: require("../../assets/uncle.jpg") },
    { label: "Aunt", image: require("../../assets/aunt.jpg") },
  ];

  const [options, setOptions] = useState([]);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [feedback, setFeedback] = useState("");

  // 🔊 Load success sound
  const playSuccessSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/success.wav")
    );
    await sound.playAsync();
  };

  const generateRound = () => {
    let selectedEmergency = [...emergencySigns]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    let oddOne = nonEmergency[Math.floor(Math.random() * nonEmergency.length)];

    let allOptions = [...selectedEmergency, oddOne].sort(() => Math.random() - 0.5);

    setCorrectIndex(allOptions.findIndex((item) => item.label === oddOne.label));
    setOptions(allOptions);
    setFeedback("");
  };

  useEffect(() => {
    generateRound();
  }, []);

  const checkAnswer = async (index) => {
    if (index === correctIndex) {
      setFeedback("Correct! 🎉");

      // 🔊 Play sound here
      await playSuccessSound();

      setTimeout(() => generateRound(), 1000);
    } else {
      setFeedback("Try Again ❌");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Odd One Out</Text>
      <Text style={styles.subtitle}>Select the item which is NOT an emergency sign</Text>

      <View style={styles.grid}>
        {options.map((item, index) => (
          <TouchableOpacity key={index} style={styles.card} onPress={() => checkAnswer(index)}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.feedback}>{feedback}</Text>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center", backgroundColor: "#f8f8f8" },
  title: { fontSize: 28, fontWeight: "bold", marginVertical: 10 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  grid: { width: "100%", flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  card: {
    width: "40%",
    backgroundColor: "#fff",
    padding: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  image: { width: 80, height: 80 },
  label: { marginTop: 8, fontSize: 16, fontWeight: "bold" },
  feedback: { fontSize: 20, marginTop: 15, fontWeight: "bold" },
  backBtn: {
    marginTop: 20,
    backgroundColor: "#4a90e2",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  backText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
