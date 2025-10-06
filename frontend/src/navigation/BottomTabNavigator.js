import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from "@expo/vector-icons";

// Import all screens
import HomeScreen from "../screens/HomeScreen";
import ConversationScreen from "../screens/ConversationScreen";
import CallScreen from "../screens/CallScreen";
import EmergencyScreen from "../screens/EmergencyScreen";
import ProfileScreen from "../screens/ProfileScreen";
import Header from "./Header";
import SettingsScreen from "../screens/SettingsScreen";
import PrivacyScreen from "../screens/PrivacyScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import SupportScreen from "../screens/SupportScreen";
import Lesson1 from '../lessons/Lesson1';
import Lesson2 from '../lessons/Lesson2';
import Lesson3 from '../lessons/Lesson3';
import Lesson4 from '../lessons/Lesson4';
import Lesson5 from '../lessons/Lesson5';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();


// Create a stack navigator for the "Home" tab
function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ 
          header: () => <Header />, // <-- This line connects your custom header
        }} 
      />
      <HomeStack.Screen name="Lesson1" component={Lesson1} />
      <HomeStack.Screen name="Lesson2" component={Lesson2} />
      <HomeStack.Screen name="Lesson3" component={Lesson3} />
      <HomeStack.Screen name="Lesson4" component={Lesson4} />
      <HomeStack.Screen name="Lesson5" component={Lesson5} />

       
    </HomeStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    <ProfileStack.Screen name="Privacy" component={PrivacyScreen} />
       <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
     <ProfileStack.Screen name="Support" component={SupportScreen} />   
    </ProfileStack.Navigator>
  );
}

export default function BottomTabNavigator() {
  return (
    <>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Conversation") iconName = "chatbubbles";
          else if (route.name === "Call") iconName = "call";
          else if (route.name === "Emergency") iconName = "alert";
          else if (route.name === "Profile") iconName = "person-circle";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4a90e2",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Conversation" component={ConversationScreen} />
      <Tab.Screen name="Call" component={CallScreen} />
      <Tab.Screen name="Emergency" component={EmergencyScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
    </>
  );
}