import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function SupportScreen() {
  const handleEmailSupport = () => {
    // Replace 'support@yourapp.com' with your actual support email
    const supportEmail = 'support@yourapp.com';
    Linking.openURL(`mailto:${supportEmail}`);
  };

  const handleFAQ = () => {
    Alert.alert('FAQ Section', 'This would navigate to a screen with Frequently Asked Questions.');
  };

  const handleReportBug = () => {
    Alert.alert('Report a Bug', 'This would open a form or email client to report an issue.');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="help-circle-outline" size={40} color="#4a90e2" />
        <Text style={styles.title}>Help & Support</Text>
      </View>

      <Text style={styles.subtitle}>
        We're here to help! Choose one of the options below to get assistance.
      </Text>

      {/* Support Options Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Get in Touch</Text>
        
        <TouchableOpacity style={styles.option} onPress={handleEmailSupport}>
          <View style={styles.optionContent}>
            <Ionicons name="mail-outline" size={24} color="#555" style={styles.icon} />
            <View>
              <Text style={styles.optionText}>Email Support</Text>
              <Text style={styles.optionSubtitle}>Send us a detailed message</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity style={styles.option} onPress={handleFAQ}>
          <View style={styles.optionContent}>
            <Ionicons name="chatbubbles-outline" size={24} color="#555" style={styles.icon} />
            <View>
              <Text style={styles.optionText}>FAQs</Text>
              <Text style={styles.optionSubtitle}>Find answers to common questions</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <View style={styles.divider} />
        
        <TouchableOpacity style={styles.option} onPress={handleReportBug}>
          <View style={styles.optionContent}>
            <MaterialCommunityIcons name="bug-outline" size={24} color="#555" style={styles.icon} />
            <View>
              <Text style={styles.optionText}>Report a Bug</Text>
              <Text style={styles.optionSubtitle}>Help us improve the app</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
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
    marginBottom: 10,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
});