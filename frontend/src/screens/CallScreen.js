// CallScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Contacts from 'expo-contacts';
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import axios from 'axios';

const CallScreen = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      setPermissionStatus(status);
    })();
  }, []);

  const handleSyncContacts = async () => {
    if (permissionStatus !== 'granted') {
      alert('Permission to access contacts was denied.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      if (data.length === 0) {
        setLoading(false);
        alert('No contacts found on your device.');
        return;
      }

      // 1. Create a Set to store unique phone numbers
      const uniqueNormalizedNumbers = new Set();
      
      // 2. Iterate through contacts and add normalized numbers to the Set
      data.forEach(contact => {
        if (contact.phoneNumbers) {
          contact.phoneNumbers.forEach(phoneObj => {
            try {
              const phoneNumber = parsePhoneNumberWithError(phoneObj.number, 'IN'); // Adjust country code
              if (phoneNumber && phoneNumber.isValid()) {
                uniqueNormalizedNumbers.add(phoneNumber.format('E.164'));
              }
            } catch (error) {
               return null; 
            }
          });
        }
      });

      // 3. Convert the Set back to an array
      const normalizedContacts = Array.from(uniqueNormalizedNumbers);

      console.log('Unique Normalized Contacts:', normalizedContacts);
      
      // TODO: Call the backend API here
      setContacts(normalizedContacts);

    } catch (error) {
      console.error('Error fetching or normalizing contacts:', error);
      alert('Failed to sync contacts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Sync</Text>
      <Text>Permission Status: {permissionStatus}</Text>
      <Button
        title={loading ? "Syncing..." : "Sync Contacts"}
        onPress={handleSyncContacts}
        disabled={loading || permissionStatus !== 'granted'}
      />
      {contacts.length > 0 && (
        <Text style={styles.contactCount}>
          Found {contacts.length} valid phone numbers.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  contactCount: { marginTop: 20, fontSize: 16 },
});

export default CallScreen;
