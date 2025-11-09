import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = 'http://10.12.249.231:5000/api';

  const fetchProfile = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(response.data);
      await AsyncStorage.setItem('myPhone', response.data.phone); // Store phone in AsyncStorage
    } catch (e) {
      console.error('Failed to fetch profile:', e);
      setProfile(null);
    }
  };

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token = null;
      try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate splash/loading
        token = await AsyncStorage.getItem('userToken');
        setUserToken(token);

        if (token) {
          await fetchProfile(token);
        }
      } catch (e) {
        console.error('Failed to load token:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

const login = async (token) => {
  try {
    await AsyncStorage.setItem('userToken', token);
    setUserToken(token);
    await fetchProfile(token); // profile now contains phone
    // ✅ After profile is fetched, register socket
    socket.connect();
    socket.emit('register', response.data.phone); // send phone to socket server
  } catch (e) {
    console.error('Failed to save token:', e);
  }
};


  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'myPhone']);
      setUserToken(null);
      setProfile(null);
    } catch (e) {
      console.error('Failed to remove token:', e);
    }
  };

  const updateProfile = (newProfileData) => {
    setProfile(prevProfile => ({ ...prevProfile, ...newProfileData }));
  };

  return (
    <AuthContext.Provider value={{ 
      userToken, 
      isLoading, 
      profile,        // includes name, email, phone
      myPhone: profile?.phone, // 🌟 Expose phone number directly
      login, 
      logout, 
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
