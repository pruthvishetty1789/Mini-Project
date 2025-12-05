import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function SplashScreen({ onFinish }) {
  return (
    <View style={styles.container}>
      <Image source={require("../../assets/hearme.jpg")} style={styles.logo} />
      {/* <Text style={styles.text}>Welcome to My App </Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
  text: {
    fontSize: 20,
    marginTop: 20,
  },
});
