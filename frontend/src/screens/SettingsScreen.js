import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook

const lightColors = {
  background: '#f0f4f7',
  card: '#fff',
  text: '#333',
  divider: '#f0f0f0',
  icon: '#555',
  versionText: '#999',
  sectionTitle: '#666',
};

const darkColors = {
  background: '#121212',
  card: '#1e1e1e',
  text: '#fff',
  divider: '#333',
  icon: '#ccc',
  versionText: '#999',
  sectionTitle: '#ccc',
};

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const colors = isDarkMode ? darkColors : lightColors;

  const toggleDarkMode = () => {
    setIsDarkMode(previousState => !previousState);
  };

  const handleOpenURL = (url) => {
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', `Could not open link: ${err.message}`);
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Settings</Text>

      {/* Account Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>Account</Text>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('EditProfile')}>
          <View style={styles.optionContent}>
            <Ionicons name="person-outline" size={24} color={colors.icon} style={styles.icon} />
            <Text style={[styles.optionText, { color: colors.text }]}>Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.icon} />
        </TouchableOpacity>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('ChangePassword')}>
          <View style={styles.optionContent}>
            <Ionicons name="lock-closed-outline" size={24} color={colors.icon} style={styles.icon} />
            <Text style={[styles.optionText, { color: colors.text }]}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.icon} />
        </TouchableOpacity>
      </View>

      {/* App Preferences Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>Preferences</Text>
        <View style={[styles.option, styles.optionWithSwitch]}>
          <View style={styles.optionContent}>
            <Ionicons name="moon-outline" size={24} color={colors.icon} style={styles.icon} />
            <Text style={[styles.optionText, { color: colors.text }]}>Dark Mode</Text>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isDarkMode ? "#f4f3f4" : "#f4f3f4"}
            onValueChange={toggleDarkMode}
            value={isDarkMode}
          />
        </View>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <TouchableOpacity style={styles.option} onPress={() => Linking.openSettings()}>
          <View style={styles.optionContent}>
            <Ionicons name="notifications-outline" size={24} color={colors.icon} style={styles.icon} />
            <Text style={[styles.optionText, { color: colors.text }]}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.icon} />
        </TouchableOpacity>
      </View>
      
      {/* Help & About Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>Help & About</Text>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Support')}>
          <View style={styles.optionContent}>
            <Ionicons name="help-circle-outline" size={24} color={colors.icon} style={styles.icon} />
            <Text style={[styles.optionText, { color: colors.text }]}>Help Center</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.icon} />
        </TouchableOpacity>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Privacy')}>
          <View style={styles.optionContent}>
            <Ionicons name="document-text-outline" size={24} color={colors.icon} style={styles.icon} />
            <Text style={[styles.optionText, { color: colors.text }]}>Terms & Privacy</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.icon} />
        </TouchableOpacity>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <TouchableOpacity style={styles.option} onPress={() => Alert.alert('About App', 'App Name: Your App\nVersion: 1.0.0\nDeveloped by: You')}>
          <View style={styles.optionContent}>
            <Ionicons name="information-circle-outline" size={24} color={colors.icon} style={styles.icon} />
            <Text style={[styles.optionText, { color: colors.text }]}>About</Text>
          </View>
          <Text style={[styles.versionText, { color: colors.versionText }]}>1.0.0</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  section: {
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
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
  },
  divider: {
    height: 1,
  },
  versionText: {
    fontSize: 14,
  },
});