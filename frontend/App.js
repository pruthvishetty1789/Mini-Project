import React, { useContext } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Context Providers
import { AuthProvider, default as AuthContext } from "./src/context/AuthContext";
import { ThemeProvider, ThemeContext } from "./src/context/ThemeContext";

// Screens
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import SplashScreen from "./src/screens/SplashScreen";

const Stack = createStackNavigator();

function AppNav() {
  const { userToken, isLoading } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);  // <- Access the theme value
  const navigationTheme = theme === 'dark' ? DarkTheme : DefaultTheme; // Native navigation themes

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen name="MainApp" component={BottomTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNav />
      </AuthProvider>
    </ThemeProvider>
  );
}
