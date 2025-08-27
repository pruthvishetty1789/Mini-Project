import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => setIsDarkMode(previousState => !previousState);

  const handlePress = (option) => {
    Alert.alert('Feature Coming Soon', `You tapped on "${option}"!`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.option} onPress={() => handlePress('Edit Profile')}>
          <View style={styles.optionContent}>
            <Ionicons name="person-outline" size={24} color="#555" style={styles.icon} />
            <Text style={styles.optionText}>Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.option} onPress={() => handlePress('Change Password')}>
          <View style={styles.optionContent}>
            <Ionicons name="lock-closed-outline" size={24} color="#555" style={styles.icon} />
            <Text style={styles.optionText}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* App Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={[styles.option, styles.optionWithSwitch]}>
          <View style={styles.optionContent}>
            <Ionicons name="moon-outline" size={24} color="#555" style={styles.icon} />
            <Text style={styles.optionText}>Dark Mode</Text>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isDarkMode ? "#f4f3f4" : "#f4f3f4"}
            onValueChange={toggleDarkMode}
            value={isDarkMode}
          />
        </View>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.option} onPress={() => handlePress('Notifications')}>
          <View style={styles.optionContent}>
            <Ionicons name="notifications-outline" size={24} color="#555" style={styles.icon} />
            <Text style={styles.optionText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>
      
      {/* Help & About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & About</Text>
        <TouchableOpacity style={styles.option} onPress={() => handlePress('Help Center')}>
          <View style={styles.optionContent}>
            <Ionicons name="help-circle-outline" size={24} color="#555" style={styles.icon} />
            <Text style={styles.optionText}>Help Center</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.option} onPress={() => handlePress('Terms & Privacy')}>
          <View style={styles.optionContent}>
            <Ionicons name="document-text-outline" size={24} color="#555" style={styles.icon} />
            <Text style={styles.optionText}>Terms & Privacy</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.option} onPress={() => handlePress('About')}>
          <View style={styles.optionContent}>
            <Ionicons name="information-circle-outline" size={24} color="#555" style={styles.icon} />
            <Text style={styles.optionText}>About</Text>
          </View>
          <Text style={styles.versionText}>1.0.0</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    padding: 15,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 10,
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
  optionWithSwitch: {
    paddingVertical: 10,
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
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});