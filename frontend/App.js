import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
   fetch("http://10.27.81.231:5000/") // use this IP instead of localhost


      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <View style={styles.container}>
      <Text>{message || "Loading..."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
