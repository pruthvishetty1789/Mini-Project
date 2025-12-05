import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons'; // Import icons

// Removed 'VoiceCallScreen' import as it's not defined here and only used for navigation
// import VoiceCallScreen from './VoiceCallScreen';

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

  // Your existing loadSyncedContacts logic (omitted for brevity, assume it's here)
  const loadSyncedContacts = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
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
              // Assuming 'IN' as the default region code is appropriate for your users
              const phoneNumber = parsePhoneNumberWithError(phoneObj.number, 'IN');
              if (phoneNumber && phoneNumber.isValid()) {
                const formatted = phoneNumber.format('E.164');
                uniqueNormalizedNumbers.add(formatted);
                if (!phoneToName[formatted]) {
                  phoneToName[formatted] = contact.name || formatted;
                }
              }
            } catch (error) {
              // console.warn(`Invalid phone number skipped: ${phoneObj.number}`);
            }
          });
        }
      });

      const normalizedContacts = Array.from(uniqueNormalizedNumbers);
      setPhoneNameMap(phoneToName);

      // --- API Call ---
      const response = await axios.post(
        'http://192.168.43.118:5000/api/contacts/sync-contacts',
        { contacts: normalizedContacts },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const friendsData = response.data.friends;
      const friendNumbers = new Set(friendsData.map(f => f.phoneNo));
      const filteredInvitable = response.data.invitable.filter(
        phone => !friendNumbers.has(phone),
      );

      setFriends(friendsData);
      setInvitable(
        filteredInvitable.map(phone => ({
          phoneNo: phone,
          name: phoneToName[phone] || phone,
        })),
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
        Alert.alert('Invite', 'Please open Instagram and share the app link manually.');
        return;
      default:
        return;
    }
    Linking.openURL(url).catch(err => {
      console.error('Failed to open app:', err);
      Alert.alert('Error', `Could not open the selected app for ${type}.`);
    });
  };

  const addToEmergency = async contact => {
    try {
      const jsonValue = await AsyncStorage.getItem('emergencyContacts');
      const currentContacts = jsonValue != null ? JSON.parse(jsonValue) : [];
      if (currentContacts.some(ec => ec.phoneNo === contact.phoneNo)) {
        Alert.alert(
          'Already Added',
          `${contact.name} is already in your emergency contacts.`,
        );
        return;
      }
      const updatedContacts = [...currentContacts, contact];
      await AsyncStorage.setItem(
        'emergencyContacts',
        JSON.stringify(updatedContacts),
      );
      Alert.alert(
        'Success',
        `${contact.name} has been added to your emergency contacts.`,
      );
    } catch (e) {
      console.error('Failed to save emergency contact:', e);
      Alert.alert('Error', 'Could not add contact to emergency list.');
    }
  };

  const handleSyncContacts = async () => {
    if (permissionStatus !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Please grant contact permission in your device settings to sync.',
      );
      return;
    }
    await loadSyncedContacts();
    await AsyncStorage.setItem('hasSyncedContacts', 'true');
    setHasSynced(true);
  };

  const renderContact = ({ item, type }) => {
    const isFriend = type === 'friend';
    const inviteMessage = `Hey, check out this app! It's great for emergency calls and connecting with friends. Download it here: [YOUR_APP_DOWNLOAD_LINK]`;

    return (
      <View style={styles.contactCard}>
        {/* Contact Info */}
        <View style={styles.contactDetails}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name[0]}</Text>
          </View>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.contactName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.contactPhone}>{item.phoneNo}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.actionButton, isFriend ? styles.callButton : styles.inviteButton]}
            onPress={() => {
              if (isFriend) {
                // Navigate to call screen (assuming it exists)
                navigation.navigate('VoiceCallScreen', {
                  receiverPhone: item.phoneNo,
                  name: item.name,
                });
              } else {
                // Show invite options
                Alert.alert(
                  'Invite Contact',
                  `How would you like to invite ${item.name}?`,
                  [
                    {
                      text: 'WhatsApp',
                      onPress: () =>
                        sendInvite('whatsapp', item.phoneNo, inviteMessage),
                    },
                    {
                      text: 'SMS',
                      onPress: () =>
                        sendInvite('sms', item.phoneNo, inviteMessage),
                    },
                    {
                      text: 'Instagram (Manual)',
                      onPress: () =>
                        sendInvite('instagram', item.phoneNo, inviteMessage),
                    },
                    { text: 'Cancel', style: 'cancel' },
                  ],
                  { cancelable: true },
                );
              }
            }}>
            {isFriend ? (
              <MaterialIcons name="call" size={18} color="#fff" />
            ) : (
              <MaterialIcons name="person-add-alt-1" size={18} color="#fff" />
            )}
            <Text style={styles.buttonText}>{isFriend ? 'Call' : 'Invite'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.emergencyButton]}
            onPress={() => addToEmergency(item)}>
            {/* <MaterialIcons name="health-and-safety" size={18} color="#fff" /> */}
            <Text style={styles.buttonText}>Emergency</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📞 Contact </Text>
      
      {/* Sync Status/Action Area */}
      <View style={styles.syncBox}>
        <Text style={styles.syncHeader}>
          {hasSynced ? 'Contacts Synced' : 'Sync Your Contacts'}
        </Text>
        
        {loading ? (
            <ActivityIndicator size="large" color={styles.themeColor.color} style={styles.loader} />
        ) : (
            <TouchableOpacity
                style={styles.syncButton}
                onPress={hasSynced ? loadSyncedContacts : handleSyncContacts}
                disabled={permissionStatus !== 'granted' && !hasSynced}
            >
                <FontAwesome5 name="sync-alt" size={14} color="#fff" />
                <Text style={styles.syncButtonText}>
                {hasSynced ? 'Refresh Contacts' : 'Sync Now'}
                </Text>
            </TouchableOpacity>
        )}

        {permissionStatus !== 'granted' && !hasSynced && (
          <Text style={styles.permissionWarning}>
            ⚠️ Contact permission is required to find your friends on the app.
          </Text>
        )}
      </View>
      
      {/* Friends List */}
      <View style={styles.listContainer}>
        {friends.length > 0 && (
          <Text style={styles.sectionTitle}>Friends on App ({friends.length})</Text>
        )}
        {friends.length > 0 && (
          <FlatList
            data={friends}
            keyExtractor={item => item.phoneNo + 'f'}
            renderItem={({ item }) => renderContact({ item, type: 'friend' })}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>

      {/* Invitable Contacts List */}
      <View style={styles.listContainer}>
        {invitable.length > 0 && (
          <Text style={styles.sectionTitle}>Invite Contacts ({invitable.length})</Text>
        )}
        {invitable.length > 0 && (
          <FlatList
            data={invitable}
            keyExtractor={item => item.phoneNo + 'i'}
            renderItem={({ item }) => renderContact({ item, type: 'invitable' })}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
      
      {/* Fallback Message */}
      {hasSynced && friends.length === 0 && invitable.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <MaterialIcons name="people-alt" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No friends found on the app yet. Invite them!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  themeColor: { color: '#4A90E2' }, // Blue
  secondaryColor: { color: '#f39c12' }, // Orange for invite/sync
  emergencyColor: { color: '#E74C3C' }, // Red for emergency
  
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Light background
    padding: 16,
  },
  
  // Header
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    color: '#333',
    marginTop: 10,
    marginBottom: 20,
  },

  // Sync Box
  syncBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  syncHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2', // Theme color
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 2,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  permissionWarning: {
    marginTop: 10,
    fontSize: 13,
    color: '#E74C3C',
    textAlign: 'center',
  },
  loader: {
    marginVertical: 10,
  },
  
  // Lists
  listContainer: {
    flex: 1,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A90E2', // Theme color
    marginTop: 15,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#EBEBEB',
  },
  
  // Contact Card
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D9E8FF', // Light blue/gray
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2', // Theme color
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactPhone: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  
  // Button Group (Call / Invite / Emergency)
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginLeft: 6,
    elevation: 1,
  },
  callButton: {
    backgroundColor: '#2ECC71', // Green for Call
  },
  inviteButton: {
    backgroundColor: '#6579ecff', // Orange for Invite
  },
  emergencyButton: {
    backgroundColor: '#E74C3C', // Red for Emergency
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  separator: {
    height: 1,
    backgroundColor: '#F5F7FA',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default CallScreen;