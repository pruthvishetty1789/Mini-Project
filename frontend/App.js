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
import MatchTheFollowing from "./src/lessons/MatchTheFollowing";
import OddOneOut from "./src/lessons/OddOneOut";
import Lesson3Quiz from "./src/lessons/Lesson3Quiz";
import Lesson5Quiz from "./src/lessons/Lesson5Quiz";
import Lesson2Quiz from "./src/lessons/Lesson2Quiz";
import OtpVerifyScreen from "./src/screens/OtpVerifyScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
const Stack = createStackNavigator();

function AppNav() {
  console.log("🔍 AppNav rendering");
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
          // Authentication screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="OtpVerifyScreen" component={OtpVerifyScreen} />
            <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
          </>
        ) : (
          // Main app
          <>
            <Stack.Screen name="MainApp" component={BottomTabNavigator} />
            <Stack.Screen name="VoiceCallScreen" component={VoiceCallScreen} />
             <Stack.Screen name="MatchTheFollowing" component={MatchTheFollowing} />
            <Stack.Screen name="OddOneOut" component={OddOneOut} />
            <Stack.Screen name="Lesson3Quiz" component={Lesson3Quiz} />
            <Stack.Screen name="Lesson5Quiz" component={Lesson5Quiz} />
            <Stack.Screen name="Lesson2Quiz" component={Lesson2Quiz} />
            
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
