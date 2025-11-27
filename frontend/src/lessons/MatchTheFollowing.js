import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Audio } from 'expo-av'; // ✅ for success sound
import ConfettiCannon from 'react-native-confetti-cannon'; // ✅ fun confetti effect

const alphabetImages = {
  a: require('../../assets/a.jpg'),
  b: require('../../assets/b.jpg'),
  c: require('../../assets/c.jpg'),
  d: require('../../assets/d.jpg'),
  e: require('../../assets/e.jpg'),
  f: require('../../assets/f.jpg'),
  g: require('../../assets/g.jpg'),
  h: require('../../assets/h.jpg'),
  i: require('../../assets/i.jpg'),
  j: require('../../assets/j.jpg'),
  k: require('../../assets/k.jpg'),
  l: require('../../assets/l.jpg'),
  m: require('../../assets/m.jpg'),
  n: require('../../assets/n.jpg'),
  o: require('../../assets/o.jpg'),
  p: require('../../assets/p.jpg'),
  q: require('../../assets/q.jpg'),
  r: require('../../assets/r.jpg'),
  s: require('../../assets/s.jpg'),
  t: require('../../assets/t.jpg'),
  u: require('../../assets/u.jpg'),
  v: require('../../assets/v.jpg'),
  w: require('../../assets/w.jpg'),
  x: require('../../assets/x.jpg'),
  y: require('../../assets/y.jpg'),
  z: require('../../assets/z.jpg'),
};

export default function MatchTheFollowing() {
  const [pairs, setPairs] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [matched, setMatched] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    generateRandomPairs();
  }, []);

  const generateRandomPairs = () => {
    const allLetters = [...'abcdefghijklmnopqrstuvwxyz'];
    const randomLetters = allLetters.sort(() => 0.5 - Math.random()).slice(0, 6);
    const shuffledImages = [...randomLetters].sort(() => 0.5 - Math.random());
    setPairs(randomLetters.map((l, i) => ({ letter: l, shuffledKey: shuffledImages[i] })));
    setMatched([]);
    setSelectedLetter(null);
    setSelectedImage(null);
    setShowConfetti(false);
  };

  const playSuccessSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/success.wav') // ✅ add a small “tada” sound file in assets
    );
    await sound.playAsync();
  };

  const handleLetterPress = (letter) => setSelectedLetter(letter);

  const handleImagePress = async (key) => {
    setSelectedImage(key);
    if (selectedLetter) {
      if (selectedLetter === key) {
        const newMatched = [...matched, key];
        setMatched(newMatched);
        setSelectedLetter(null);
        setSelectedImage(null);

        if (newMatched.length === 6) {
          setShowConfetti(true);
          await playSuccessSound();
          Alert.alert('🎉 Amazing!', 'You matched all correctly!');
          setTimeout(generateRandomPairs, 2500);
        }
      } else {
        Alert.alert('❌ Wrong Match', 'Try again!');
        setSelectedLetter(null);
        setSelectedImage(null);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {showConfetti && <ConfettiCannon count={200} origin={{ x: 200, y: 0 }} fadeOut={true} />}

      <Text style={styles.title}>🎯 Match the Alphabets with Signs</Text>
      <Text style={styles.subtitle}>Tap a letter and match it with the correct sign</Text>

      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Alphabets</Text>
          {pairs.map((p, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.card,
                selectedLetter === p.letter && styles.selectedCard,
                matched.includes(p.letter) && styles.correctCard,
              ]}
              onPress={() => handleLetterPress(p.letter)}
              disabled={matched.includes(p.letter)}
            >
              <Text style={styles.cardText}>{p.letter.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Signs</Text>
          {pairs.map((p, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.card,
                selectedImage === p.shuffledKey && styles.selectedCard,
                matched.includes(p.shuffledKey) && styles.correctCard,
              ]}
              onPress={() => handleImagePress(p.shuffledKey)}
              disabled={matched.includes(p.shuffledKey)}
            >
              <Image source={alphabetImages[p.shuffledKey]} style={styles.image} resizeMode="contain" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={generateRandomPairs}>
        <Text style={styles.refreshText}>🔄 Try New Set</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#eef6fd',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
    marginBottom: 25,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  column: {
    width: '45%',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#0984e3',
  },
  card: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    width: '90%',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#dfe6e9',
  },
  selectedCard: {
    backgroundColor: '#ffeaa7',
  },
  correctCard: {
    backgroundColor: '#55efc4',
    borderColor: '#00b894',
  },
  cardText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  image: {
    width: 70,
    height: 70,
  },
  refreshButton: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginTop: 30,
  },
  refreshText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});