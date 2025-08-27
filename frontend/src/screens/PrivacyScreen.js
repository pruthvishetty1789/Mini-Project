import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark-outline" size={40} color="#4a90e2" />
        <Text style={styles.title}>Privacy Policy</Text>
      </View>
      
      <View style={styles.policySection}>
        <Text style={styles.sectionTitle}>1. Data Collection</Text>
        <Text style={styles.policyText}>
          We collect personal data that you voluntarily provide to us when you register on the app,
          such as your name, email address, and profile picture. We also collect
          information from your interactions with our services.
        </Text>
      </View>

      <View style={styles.policySection}>
        <Text style={styles.sectionTitle}>2. How We Use Your Data</Text>
        <Text style={styles.policyText}>
          Your data is used to provide and improve our services, to personalize your experience,
          and to communicate with you about your account. We may also use it for analytics
          and to prevent fraudulent activity.
        </Text>
      </View>

      <View style={styles.policySection}>
        <Text style={styles.sectionTitle}>3. Your Rights</Text>
        <Text style={styles.policyText}>
          You have the right to access, correct, or delete your personal information.
          You can manage your data directly from your account settings.
        </Text>
      </View>

      <View style={styles.policySection}>
        <Text style={styles.sectionTitle}>4. Contact Us</Text>
        <Text style={styles.policyText}>
          If you have any questions about this privacy policy, please contact us at:
          support@yourapp.com
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 15,
  },
  policySection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 10,
  },
  policyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
});