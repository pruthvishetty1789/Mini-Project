import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Linking, ActivityIndicator } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from '@react-navigation/native';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';

const EmergencyScreen = () => {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const isFocused = useIsFocused();

  const loadEmergencyContacts = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('emergencyContacts');
      const contacts = jsonValue != null ? JSON.parse(jsonValue) : [];
      setEmergencyContacts(contacts);
    } catch (e) {
      console.error("Failed to load emergency contacts:", e);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadEmergencyContacts();
    }
  }, [isFocused]);

  const handleSOS = async () => {
    setIsSending(true);
    try {
      if (emergencyContacts.length === 0) {
        Alert.alert('No Contacts', 'Please add at least one emergency contact first.');
        setIsSending(false);
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied. Please enable it in your phone settings.');
        setIsSending(false);
        return;
      }

      let location;
      try {
        location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High, timeout: 3000 });
      } catch {
        Alert.alert('Location Not Found', 'Failed to get your current location. Check GPS signal.');
        setIsSending(false);
        return;
      }
      
      const { latitude, longitude } = location.coords;
      const locationLink = `https://maps.google.com/?q=${latitude},${longitude}`;
      const message = `🚨 I am in a difficult situation and need help. My last known location is here: ${locationLink}`;
      const phoneNumbers = emergencyContacts.map(contact => contact.phoneNo).join(',');
      const url = `sms:${phoneNumbers}?body=${encodeURIComponent(message)}`;
      await Linking.openURL(url);
      Alert.alert('SMS App Opened', 'An emergency message has been prepared. Press "Send" to complete.');

    } catch (error) {
      Alert.alert('Error', 'Failed to send SOS.');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleCallEmergency = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => Alert.alert("Error", "Could not initiate call."));
  };

  const handleRemoveEmergency = async (contactToRemove) => {
    Alert.alert(
      "Remove Contact",
      `Are you sure you want to remove ${contactToRemove.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: async () => {
            const updatedContacts = emergencyContacts.filter(
              (contact) => contact.phoneNo !== contactToRemove.phoneNo
            );
            setEmergencyContacts(updatedContacts);
            try {
              await AsyncStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
              Alert.alert("Removed", `${contactToRemove.name} has been removed.`);
            } catch {
              Alert.alert("Error", "Could not remove contact.");
            }
          },
        },
      ]
    );
  };

  const renderContact = ({ item }) => (
    <View style={styles.contactItem}>
      <View>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>{item.phoneNo}</Text>
      </View>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: '#28a745' }]}
          onPress={() => handleCallEmergency(item.phoneNo)}
        >
          <MaterialIcons name="call" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: '#dc3545' }]}
          onPress={() => handleRemoveEmergency(item)}
        >
          <MaterialIcons name="delete" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>
      
      <TouchableOpacity
        style={styles.sosButton}
        onPress={handleSOS}
        disabled={isSending}
      >
        {isSending ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Text style={styles.sosButtonText}>SOS</Text>
        )}
      </TouchableOpacity>

      {emergencyContacts.length > 0 ? (
        <FlatList
          data={emergencyContacts}
          keyExtractor={(item) => item.phoneNo}
          renderItem={renderContact}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      ) : (
        <Text style={styles.emptyMessage}>No emergency contacts added yet.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  sosButton: {
    backgroundColor: '#dc3545',
    width: 160,
    height: 160,
    borderRadius: 100,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
    color: '#777',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    marginVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  contactPhone: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    elevation: 4,
  },
});

export default EmergencyScreen;
