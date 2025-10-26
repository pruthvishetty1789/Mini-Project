import React, { useEffect, useState } from 'react';
import VoiceCallScreen from './VoiceCallScreen';
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import * as Contacts from 'expo-contacts';
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

const CallScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [friends, setFriends] = useState([]);
  const [invitable, setInvitable] = useState([]);
  const [phoneNameMap, setPhoneNameMap] = useState({});
  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      setPermissionStatus(status);

      const syncedValue = await AsyncStorage.getItem('hasSyncedContacts');
      if (syncedValue === 'true') {
        setHasSynced(true);
      }
    })();
  }, []);

  const loadSyncedContacts = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert('Authentication Error', 'User is not logged in.');
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      const uniqueNormalizedNumbers = new Set();
      const phoneToName = {};

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
              console.warn(`Invalid phone number skipped: ${phoneObj.number}`);
            }
          });
        }
      });

      const normalizedContacts = Array.from(uniqueNormalizedNumbers);
      setPhoneNameMap(phoneToName);

      const response = await axios.post(
        "http://192.168.43.220:5000/api/contacts/sync-contacts",
        { contacts: normalizedContacts },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const friendsData = response.data.friends;
      const friendNumbers = new Set(friendsData.map(f => f.phoneNo));
      const filteredInvitable = response.data.invitable.filter(
        phone => !friendNumbers.has(phone)
      );

      setFriends(friendsData);
      setInvitable(
        filteredInvitable.map(phone => ({
          phoneNo: phone,
          name: phoneToName[phone] || phone,
        }))
      );
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Load Failed', 'Failed to load contacts from the server.');
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = (type, phoneNumber, message) => {
    let url;
    switch (type) {
      case 'whatsapp':
        url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
        break;
      case 'sms':
        url = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
        break;
      case 'instagram':
        Alert.alert('Invite', 'Please open Instagram and share the link manually.');
        return;
      default:
        return;
    }
    Linking.openURL(url).catch(err => {
      console.error("Failed to open app:", err);
      Alert.alert('Error', `Could not open the selected app for ${type}.`);
    });
  };

  const addToEmergency = async (contact) => {
    try {
      const jsonValue = await AsyncStorage.getItem('emergencyContacts');
      const currentContacts = jsonValue != null ? JSON.parse(jsonValue) : [];
      if (currentContacts.some(ec => ec.phoneNo === contact.phoneNo)) {
        Alert.alert("Already Added", `${contact.name} is already in your emergency contacts.`);
        return;
      }
      const updatedContacts = [...currentContacts, contact];
      await AsyncStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
      Alert.alert("Success", `${contact.name} has been added to your emergency contacts.`);
    } catch (e) {
      console.error("Failed to save emergency contact:", e);
      Alert.alert("Error", "Could not add contact to emergency list.");
    }
  };

  const handleSyncContacts = async () => {
    if (permissionStatus !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access contacts was denied.');
      return;
    }
    await loadSyncedContacts();
    await AsyncStorage.setItem('hasSyncedContacts', 'true');
    setHasSynced(true);
  };

  const renderContact = ({ item, type }) => {
    const inviteMessage = `Hey, check out this app! It's great for emergency calls and connecting with friends. Download it here: [YOUR_APP_DOWNLOAD_LINK]`;
    return (
      <View style={styles.contactItem}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>{item.phoneNo}</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (type === "friend") {
            navigation.navigate("VoiceCallScreen", {
            receiverPhone: item.phoneNo,
            name: item.name
          });
              } else {
                Alert.alert('Invite Contact', `How would you like to invite ${item.name}?`, [
                  { text: 'WhatsApp', onPress: () => sendInvite('whatsapp', item.phoneNo, inviteMessage) },
                  { text: 'SMS', onPress: () => sendInvite('sms', item.phoneNo, inviteMessage) },
                  { text: 'Instagram', onPress: () => sendInvite('instagram', item.phoneNo, inviteMessage) },
                  { text: 'Cancel', style: 'cancel' },
                ], { cancelable: true });
              }
            }}
          >
            <Text style={styles.buttonText}>{type === "friend" ? "Call" : "Invite"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.emergencyButton]}
            onPress={() => addToEmergency(item)}
          >
            <Text style={styles.buttonText}>Add to Emergency</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Sync</Text>
      {!hasSynced && (
        <>
          <Text style={styles.statusText}>Permission Status: {permissionStatus}</Text>
          <Button
            title={loading ? "Syncing..." : "Sync Contacts"}
            onPress={handleSyncContacts}
            disabled={loading || permissionStatus !== 'granted'}
          />
        </>
      )}
      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
      {hasSynced && (
        <>
          <Text style={styles.syncedMessage}>Contacts are already synced.</Text>
          <Button
            title={loading ? "Loading..." : "Show Synced Contacts"}
            onPress={loadSyncedContacts}
            disabled={loading}
          />
        </>
      )}
      {friends.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Friends on App</Text>
          <FlatList
            data={friends}
            keyExtractor={(item) => item.phoneNo}
            renderItem={({ item }) => renderContact({ item, type: "friend" })}
          />
        </>
      )}
      {invitable.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Invite Contacts</Text>
          <FlatList
            data={invitable}
            keyExtractor={(item) => item.phoneNo}
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
  statusText: { marginBottom: 10, fontSize: 16, textAlign: 'center' },
  syncedMessage: { fontSize: 16, textAlign: 'center', marginVertical: 20, color: 'green' },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  contactName: { fontSize: 16, flex: 1 },
  contactPhone: { fontSize: 12, color: '#666', marginRight: 10 },
  buttonGroup: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { backgroundColor: '#007bff', padding: 8, borderRadius: 5, marginLeft: 5 },
  emergencyButton: { backgroundColor: '#dc3545' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});

export default CallScreen;