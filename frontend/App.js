import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthProvider, default as AuthContext } from "./src/context/AuthContext";
import SocketManager from "./src/SocketManager";

// Import screens
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import LoginScreen from "./src/screens/LoginScreen"; 
import RegisterScreen from "./src/screens/RegisterScreen"; 
import SplashScreen from "./src/screens/SplashScreen";

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
          </>
        ) : (
          // Main app
          <Stack.Screen name="MainApp" component={BottomTabNavigator} />
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
