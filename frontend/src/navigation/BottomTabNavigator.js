import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

// Import screens
import HomeScreen from "../screens/HomeScreen";
import ConversationScreen from "../screens/ConversationScreen";
import CallScreen from "../screens/CallScreen";
import VoiceCallScreen from "../screens/VoiceCallScreen"; // Added
import EmergencyScreen from "../screens/EmergencyScreen";
import ProfileScreen from "../screens/ProfileScreen";
import Header from "./Header";
import SettingsScreen from "../screens/SettingsScreen";
import PrivacyScreen from "../screens/PrivacyScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import SupportScreen from "../screens/SupportScreen";
import Lesson1 from "../lessons/Lesson1";
import Lesson2 from "../lessons/Lesson2";
import Lesson3 from "../lessons/Lesson3";
import Lesson4 from "../lessons/Lesson4";
import Lesson5 from "../lessons/Lesson5";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const ProfileStack = createStackNavigator();

// Home Stack
function HomeStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ header: () => <Header /> }}
      />
      <Stack.Screen name="Lesson1" component={Lesson1} />
      <Stack.Screen name="Lesson2" component={Lesson2} />
      <Stack.Screen name="Lesson3" component={Lesson3} />
      <Stack.Screen name="Lesson4" component={Lesson4} />
      <Stack.Screen name="Lesson5" component={Lesson5} />
    </Stack.Navigator>
  );
}

// Call Stack (CallScreen + VoiceCallScreen)
function CallStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CallScreen"
        component={CallScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VoiceCallScreen"
        component={VoiceCallScreen}
        options={{ headerTitle: "Voice Call" }}
      />
    </Stack.Navigator>
  );
}

// Profile Stack
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="Privacy" component={PrivacyScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="Support" component={SupportScreen} />
    </ProfileStack.Navigator>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: "home",
            Conversation: "chatbubbles",
            Call: "call",
            Emergency: "alert",
            Profile: "person-circle",
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4a90e2",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Conversation" component={ConversationScreen} />
      <Tab.Screen name="Call" component={CallStackScreen} />
      <Tab.Screen name="Emergency" component={EmergencyScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}
