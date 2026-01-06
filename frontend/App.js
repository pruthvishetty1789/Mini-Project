import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthProvider, default as AuthContext } from "./src/context/AuthContext";
import SocketManager from "./src/SocketManager";
import VoiceCallScreen from "./src/screens/VoiceCallScreen"; // Example import

// Import screens
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import SplashScreen from "./src/screens/SplashScreen";

// NEW: Forgot password / OTP screens
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import OtpVerifyScreen from "./src/screens/OtpVerifyScreen";

const Stack = createStackNavigator();

function AppNav() {
  console.log(" AppNav rendering");
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    // Show SplashScreen while checking authentication
    return <SplashScreen />;
  }
  console.log("userToken in AppNav:", userToken);
  return (
    <NavigationContainer>
      {/* Mount SocketManager only if user is logged in */}
      {userToken != null && <SocketManager />}

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          // Authentication screens (unauthenticated)
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />

            {/* Forgot password flow — accessible when not logged in */}
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
          </>
        ) : (
          // Main app (authenticated)
          <>
            <Stack.Screen name="MainApp" component={BottomTabNavigator} />
            <Stack.Screen name="VoiceCallScreen" component={VoiceCallScreen} />
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
