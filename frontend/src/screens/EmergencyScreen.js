import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Linking, ActivityIndicator } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from '@react-navigation/native';
import * as Location from 'expo-location';

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

      // 1. Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied. Please enable it in your phone settings.');
        setIsSending(false);
        return;
      }

      // 2. Get current location with a reduced timeout (3 seconds) for quick response
      let location;
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 3000, // Reduced to 3 seconds
        });
      } catch (locationError) {
        console.error('Location fetch failed:', locationError);
        Alert.alert(
          'Location Not Found',
          'Failed to get your current location. Please check your GPS signal and settings.'
        );
        setIsSending(false);
        return;
      }
      
      const { latitude, longitude } = location.coords;
      
      // Use the standard, functional Google Maps query format.
      const locationLink = `https://maps.google.com/?q=${latitude},${longitude}`;

      // 4. Prepare the message
      const message = `🚨 I am in a difficult situation and need help. My last known location is here: ${locationLink}`;

      // 5. Get all phone numbers and join them into a single string
      const phoneNumbers = emergencyContacts.map(contact => contact.phoneNo).join(',');

      // 6. Create a single SMS link and open it
      // This uses a comma-separated list of numbers for multi-recipient SMS
      const url = `sms:${phoneNumbers}?body=${encodeURIComponent(message)}`;
      await Linking.openURL(url);

      Alert.alert('SMS App Opened', 'An emergency message has been prepared for your contacts. Please press "Send" to complete.');

    } catch (error) {
      console.error('SOS failed:', error);
      Alert.alert('Error', 'Failed to send SOS. Please check your network and permissions.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCallEmergency = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch(err => {
      console.error("Failed to make a call:", err);
      Alert.alert("Error", "Could not initiate call.");
    });
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
            } catch (e) {
              console.error("Failed to remove contact:", e);
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
          style={styles.callButton}
          onPress={() => handleCallEmergency(item.phoneNo)}
        >
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveEmergency(item)}
        >
          <Text style={styles.buttonText}>Remove</Text>
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
    backgroundColor: '#fff', // Or use your theme colors
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333', // Or use your theme colors
  },
  sosButton: {
    backgroundColor: '#dc3545',
    padding: 20,
    borderRadius: 50,
    alignSelf: 'center',
    marginVertical: 20,
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333', // Or use your theme colors
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  removeButton: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EmergencyScreen;