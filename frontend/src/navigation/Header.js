import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Header = () => {
  return (
    <View style={styles.headerContainer}>
      <Image
        source={require('../../assets/hearme.jpg')} // Replace with your logo's path
        style={styles.logo}
        resizeMode="contain"
      />
      {/* <Text style={styles.headerText}>My App Name</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    height: 100, // Adjust the height as needed
    backgroundColor: '#ffffff', // Choose your background color
    justifyContent: 'space-between',
    // alignItems: 'center',
    paddingTop: 20, // Add padding for status bar on iOS
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logo: {
    width: 100, // Adjust the size of your logo
    height: 100,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default Header;