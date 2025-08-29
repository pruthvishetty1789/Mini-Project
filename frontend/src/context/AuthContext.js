import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // We'll use this to fetch profile data

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [profile, setProfile] = useState(null); // NEW: State to hold user profile data
  const [isLoading, setIsLoading] = useState(true);

  // This function fetches the user's profile and sets it in state
  const fetchProfile = async (token) => {
    try {
      console.log('Sending token:', token);

      const response = await axios.get('http://192.168.43.220:5000/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(response.data);
    } catch (e) {
      console.error('Failed to fetch profile:', e);
      setProfile(null);
    }
  };

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token = null;
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
        if (token) {
          await fetchProfile(token); // Fetch profile on app start if token exists
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
      await fetchProfile(token); // Fetch profile on login
    } catch (e) {
      console.error('Failed to save token:', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setUserToken(null);
      setProfile(null); // Clear profile on logout
    } catch (e) {
      console.error('Failed to remove token:', e);
    }
  };

  // NEW: Function to update the profile state
  const updateProfile = (newProfileData) => {
    setProfile(prevProfile => ({ ...prevProfile, ...newProfileData }));
  };

  return (
    <AuthContext.Provider value={{ userToken, setUserToken, isLoading, profile, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;