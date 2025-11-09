import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, Button, StyleSheet, FlatList,
  TouchableOpacity, Alert, ActivityIndicator, Linking
} from 'react-native';
import * as Contacts from 'expo-contacts';
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from '../context/ThemeContext'; // Import Theme Context
import { lightTheme, darkTheme } from '../theme/colors'; // Theme colors

const CallScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext); // Get current theme from context
  const colors = theme === 'dark' ? darkTheme : lightTheme;

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
      if (syncedValue === 'true') setHasSynced(true);
    })();
  }, []);

  const loadSyncedContacts = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
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
        "http://10.12.249.231:5000/api/contacts/sync-contacts",
        { contacts: normalizedContacts },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const friendsData = response.data.friends;
      const friendNumbers = new Set(friendsData.map(f => f.phoneNo));
      const filteredInvitable = response.data.invitable.filter(
        phone => !friendNumbers.has(phone)
      );

      setFriends(friendsData);
      setInvitable(filteredInvitable.map(phone => ({
        phoneNo: phone,
        name: phoneToName[phone] || phone,
      })));

      await AsyncStorage.setItem('hasSyncedContacts', 'true');
      setHasSynced(true);

    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Load Failed', 'Failed to load contacts.');
    } finally {
      setLoading(false);
    }
  };

  const addToEmergency = async (contact) => {
    try {
      const jsonValue = await AsyncStorage.getItem('emergencyContacts');
      const currentContacts = jsonValue ? JSON.parse(jsonValue) : [];

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

  const renderContact = ({ item, type }) => {
    const inviteMessage = `Hey, check out this app! It helps you connect with friends quickly.`;
    return (
      <View style={[styles.contactItem, { backgroundColor: colors.card, borderColor: colors.divider }]}>
        <View>
          <Text style={[styles.contactName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.contactPhone, { color: colors.versionText }]}>{item.phoneNo}</Text>
        </View>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              if (type === "friend") {
                navigation.navigate("VoiceCallScreen", { receiverPhone: item.phoneNo });
              } else {
                Alert.alert('Invite Contact', `Invite ${item.name}?`, [
                  { text: 'WhatsApp', onPress: () => Linking.openURL(`whatsapp://send?phone=${item.phoneNo}&text=${inviteMessage}`) },
                  { text: 'SMS', onPress: () => Linking.openURL(`sms:${item.phoneNo}?body=${inviteMessage}`) },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }
            }}
          >
            <Text style={styles.buttonText}>{type === "friend" ? "Call" : "Invite"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.emergencyButton, { backgroundColor: colors.danger }]}
            onPress={() => addToEmergency(item)}
          >
            <Text style={styles.buttonText}>Emergency</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Contact Sync</Text>

      {!hasSynced ? (
        <>
          <Text style={[styles.statusText, { color: colors.text }]}>Permission Status: {permissionStatus}</Text>
          <Button
            title={loading ? "Syncing..." : "Sync Contacts"}
            onPress={loadSyncedContacts}
            disabled={loading || permissionStatus !== 'granted'}
            color={colors.primary}
          />
        </>
      ) : (
        <>
          <Text style={[styles.syncedMessage, { color: colors.primary }]}>Contacts are already synced.</Text>
          <Button
            title={loading ? "Loading..." : "Show Synced Contacts"}
            onPress={loadSyncedContacts}
            disabled={loading}
            color={colors.primary}
          />
        </>
      )}

      {loading && <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />}

      {friends.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.divider }]}>Friends on App</Text>
          <FlatList
            data={friends}
            keyExtractor={(item) => item.phoneNo}
            renderItem={({ item }) => renderContact({ item, type: "friend" })}
          />
        </>
      )}

      {invitable.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.divider }]}>Invite Contacts</Text>
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
  container: { 
    flex: 1, 
    paddingTop: 10, 
    paddingHorizontal: 18, 
  },
  title: { 
    fontSize: 26, 
    fontWeight: '800', 
    marginTop: 25, 
    marginBottom: 10, 
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  syncedMessage: { 
    fontSize: 16, 
    textAlign: 'center', 
    marginVertical: 15, 
    fontWeight: '600',
  },
  
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    marginTop: 30, 
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 2,
  },

  contactItem: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  contactName: { 
    fontSize: 17, 
    fontWeight: '600',
  },
  contactPhone: { 
    fontSize: 13, 
    marginTop: 3,
  },

  buttonGroup: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginLeft: 15,
  },
  actionButton: { 
    paddingVertical: 8, 
    paddingHorizontal: 14,
    borderRadius: 20,
    marginHorizontal: 4,
    minWidth: 70,
    alignItems: 'center',
  },
  emergencyButton: {},
  buttonText: { 
    color: '#FFFFFF', 
    fontWeight: '700', 
    fontSize: 13,
  },
  
  statusText: { marginBottom: 10, fontSize: 16, textAlign: 'center' },
  loader: { marginVertical: 10 },
});

export default CallScreen;
