import React, { useContext } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthProvider, default as AuthContext } from "./src/context/AuthContext";

// Import your screens and navigators
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import LoginScreen from "./src/screens/LoginScreen"; 
import RegisterScreen from "./src/screens/RegisterScreen"; 
import SplashScreen from "./src/screens/SplashScreen"; // Import the SplashScreen


const Stack = createStackNavigator();

function AppNav() {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    // Show the SplashScreen explicitly while authentication is being checked
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          // No token found, show the authentication screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          
          </>
        ) : (
          // A token was found, show the main app
           <>
          <Stack.Screen name="MainApp" component={BottomTabNavigator} />
         
        </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNav />
    </AuthProvider>
  );
}