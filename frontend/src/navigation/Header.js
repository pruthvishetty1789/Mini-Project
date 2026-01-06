import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Header = () => {
  return (
    <View style={styles.headerContainer}>
      <Image
        source={require('../../assets/logohome.png')} // Replace with your logo's path
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Adjusted headerContainer height and padding to better match the screenshot
  headerContainer: {
    width: '100%',
    height: 70, // Reduced height (Original was 100)
    backgroundColor: '#ffffff',
    justifyContent: 'center', // Vertically center the content
    paddingHorizontal: 20, // Add horizontal padding on the sides
    paddingTop: 10, // Reduced top padding (Original was 20)
    borderBottomWidth: 0, // Removed border for a cleaner look, as it's not prominent in the screenshot
    elevation: 0, // Removed shadow/elevation as it's not prominent
    // Removed all shadow properties for simplicity/matching the flat look
  },
  // Adjusted logo size to be smaller and fit better
  logo: {
    width: 60, // Increased width to accommodate the "HearMe" text/icon combo
    height: 90, // Reduced height (Original was 100)
  },
  // You can keep headerText for future use but it's not being used here
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default Header;