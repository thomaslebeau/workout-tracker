import React from "react";
import { View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Dumbbell, Clock, TrendingUp, User } from "lucide-react-native";
import WorkoutScreen from "../screens/WorkoutScreen";
import HistoryScreen from "../screens/HistoryScreen";
import StatsScreen from "../screens/StatsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors, typography } from "../theme";

export type RootTabParamList = {
  Workout: undefined;
  History: undefined;
  Stats: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bgPrimary,
    card: colors.bgPrimary,
    border: colors.border,
  },
};

export default function AppNavigator() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.bgSecondary,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              shadowColor: "transparent",
              elevation: 0,
            },
            headerTitleStyle: {
              ...typography.heading,
              color: colors.textPrimary,
            },
            tabBarStyle: {
              backgroundColor: colors.bgPrimary,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            },
            sceneStyle: {
              backgroundColor: colors.bgPrimary,
            },
            tabBarActiveTintColor: colors.accentBlue,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: {
              fontFamily: "Rajdhani_600SemiBold",
              fontSize: 12,
              textTransform: "uppercase",
            },
          }}
        >
          <Tab.Screen
            name="Workout"
            component={WorkoutScreen}
            options={{
              title: "TRAINING",
              tabBarIcon: ({ color }) => (
                <View>
                  <Dumbbell size={24} color={color} strokeWidth={1.5} />
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              title: "HISTORY",
              tabBarIcon: ({ color }) => (
                <View>
                  <Clock size={24} color={color} strokeWidth={1.5} />
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="Stats"
            component={StatsScreen}
            options={{
              title: "STATS",
              tabBarIcon: ({ color }) => (
                <View>
                  <TrendingUp size={24} color={color} strokeWidth={1.5} />
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: "PROFILE",
              tabBarIcon: ({ color }) => (
                <View>
                  <User size={24} color={color} strokeWidth={1.5} />
                </View>
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}
