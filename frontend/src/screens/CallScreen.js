// CallScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import * as Contacts from 'expo-contacts';
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

const CallScreen = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [friends, setFriends] = useState([]);
  const [invitable, setInvitable] = useState([]);
  const [phoneNameMap, setPhoneNameMap] = useState({}); // Map phone -> name

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

      const uniqueNormalizedNumbers = new Set();
      const phoneToName = {}; // Temp map

      data.forEach(contact => {
        if (contact.phoneNumbers) {
          contact.phoneNumbers.forEach(phoneObj => {
            try {
              const phoneNumber = parsePhoneNumberWithError(phoneObj.number, 'IN');
              if (phoneNumber && phoneNumber.isValid()) {
                const formatted = phoneNumber.format('E.164');
                uniqueNormalizedNumbers.add(formatted);
                if (!phoneToName[formatted]) {
                  phoneToName[formatted] = contact.name || formatted;
                }
              }
            } catch (error) {
              return null;
            }
          });
        }
      });

      const normalizedContacts = Array.from(uniqueNormalizedNumbers);
      setContacts(normalizedContacts);
      setPhoneNameMap(phoneToName);

      const token = await AsyncStorage.getItem("userToken");
      console.log("Sending token with request:", token);

      try {
        const response = await axios.post(
          "http://192.168.43.220:5000/api/contacts/sync-contacts",
          { contacts: normalizedContacts },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        alert("Contacts synced successfully!");
        const friendsData = response.data.friends; // { name, phoneNo }
        const invitablePhones = response.data.invitable; // phone numbers

        setFriends(friendsData);
        setInvitable(invitablePhones.map(phone => ({
          phoneNo: phone,
          name: phoneToName[phone] || phone
        })));

      } catch (err) {
        console.error("Error sending contacts to backend:", err);
        alert("Failed to sync contacts with server.");
      }

    } catch (error) {
      console.error('Error fetching or normalizing contacts:', error);
      alert('Failed to sync contacts.');
    } finally {
      setLoading(false);
    }
  };

  const renderContact = ({ item, type }) => (
    <View style={styles.contactItem}>
      <Text style={styles.contactName}>{item.name}</Text>
      <Text style={styles.contactPhone}>{item.phoneNo}</Text>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          if (type === "friend") {
            Alert.alert("Call", `Calling ${item.name}...`);
          } else {
            Alert.alert("Invite", `Invite sent to ${item.name}`);
          }
        }}
      >
        <Text style={styles.buttonText}>{type === "friend" ? "Call" : "Invite"}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Sync</Text>
      <Text>Permission Status: {permissionStatus}</Text>
      <Button
        title={loading ? "Syncing..." : "Sync Contacts"}
        onPress={handleSyncContacts}
        disabled={loading || permissionStatus !== 'granted'}
      />

      {friends.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Friends on App</Text>
          <FlatList
            data={friends}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => renderContact({ item, type: "friend" })}
          />
        </>
      )}

      {invitable.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Invite Contacts</Text>
          <FlatList
            data={invitable}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => renderContact({ item, type: "invitable" })}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  contactItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  contactName: { fontSize: 10 },
  contactPhone: { fontSize: 12, color: '#666' },
  actionButton: { backgroundColor: '#007bff', padding: 8, borderRadius: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default CallScreen;

