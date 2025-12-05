// src/screens/OtpVerifyScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.43.220:5000/api';

export default function OtpVerifyScreen({ route, navigation }) {
  const { email: routeEmail } = route.params || {};
  const [email, setEmail] = useState(routeEmail || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // -------------------------
  // RESET PASSWORD WITH OTP
  // -------------------------
  const handleReset = async () => {
    if (!email || !otp || !password) {
      return Alert.alert('Error', 'Please fill all fields.');
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/reset-password-otp`, {
        email: email.trim(),
        otp: otp.trim(),
        password: password.trim(),
      });

      Alert.alert('Success', res.data.message || 'Password reset successful');
      navigation.navigate('Login');

    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. Try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // RESEND OTP
  // -------------------------
  const handleResend = async () => {
    if (!email) {
      return Alert.alert('Error', 'Enter email to resend OTP.');
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/request-reset-otp`, { email });
      const otpDev = res.data.otp;

      Alert.alert(
        'OTP Sent',
        'Check your email.' + (otpDev ? `\n(Dev OTP: ${otpDev})` : '')
      );

    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP & Reset</Text>
      <Text style={styles.subtitle}>
        Enter OTP sent to your email and set a new password.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="OTP (6 digits)"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="New password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resend}
        onPress={handleResend}
        disabled={loading}
      >
        <Text style={styles.resendText}>Resend OTP</Text>
      </TouchableOpacity>
    </View>
  );
}

// ----------------------
// STYLES
// ----------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f8f8'
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12
  },
  button: {
    height: 50,
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  resend: {
    marginTop: 12,
    alignItems: 'center'
  },
  resendText: {
    color: '#4a90e2',
    fontWeight: '600'
  }
});
