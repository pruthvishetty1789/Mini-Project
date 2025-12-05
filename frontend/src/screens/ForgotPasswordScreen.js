// src/screens/ForgotPasswordScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.43.220:5000/api'; // keep same base as LoginScreen

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    if (!email) return Alert.alert('Error', 'Please enter your email.');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/request-reset-otp`, { email });
      const otp = res.data.otp; // dev-only (will be absent in production)
      Alert.alert('OTP Sent', 'Check your email for the OTP.' + (otp ? `\n(Dev OTP: ${otp})` : ''));
      navigation.navigate('OtpVerifyScreen', { email }); // pass email to next screen
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to send OTP. Try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your account email to receive an OTP</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={handleRequestOtp} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, justifyContent:'center', backgroundColor:'#f8f8f8' },
  title: { fontSize:24, fontWeight:'700', marginBottom:6, textAlign:'center' },
  subtitle: { fontSize:14, color:'#666', marginBottom:20, textAlign:'center' },
  input: { height:50, backgroundColor:'#fff', borderRadius:8, paddingHorizontal:12, marginBottom:12 },
  button: { height:50, backgroundColor:'#4a90e2', borderRadius:8, justifyContent:'center', alignItems:'center' },
  buttonText: { color:'#fff', fontSize:16, fontWeight:'600' }
});