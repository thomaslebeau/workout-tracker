import React, { useEffect, useState, useRef } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import AppNavigator from "./src/navigation/AppNavigator";
import { initDatabase, getSetting, setSetting } from "./src/database/db";
import { requestNotificationPermissions } from "./src/utils/notifications";
import { colors } from "./src/theme";
import LoadingScreen from "./src/components/LoadingScreen";
import NotificationPermissionModal from "./src/components/NotificationPermissionModal";

const MIN_SPLASH_MS = 2500;

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [showApp, setShowApp] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const splashOpacity = useRef(new Animated.Value(1)).current;

  const [fontsLoaded] = useFonts({
    Rajdhani_400Regular: require("@expo-google-fonts/rajdhani/400Regular/Rajdhani_400Regular.ttf"),
    Rajdhani_600SemiBold: require("@expo-google-fonts/rajdhani/600SemiBold/Rajdhani_600SemiBold.ttf"),
    Rajdhani_700Bold: require("@expo-google-fonts/rajdhani/700Bold/Rajdhani_700Bold.ttf"),
    ShareTechMono_400Regular: require("@expo-google-fonts/share-tech-mono/400Regular/ShareTechMono_400Regular.ttf"),
  });

  useEffect(() => {
    try {
      initDatabase();
      setDbReady(true);
    } catch (error) {
      console.error("Database initialization failed:", error);
    }

    if (Platform.OS === "android") {
      NavigationBar.setButtonStyleAsync("light");
    }
  }, []);

  const allReady = dbReady && fontsLoaded;

  useEffect(() => {
    if (!allReady) return;

    const timer = setTimeout(() => {
      setShowApp(true);
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Check notification permission after splash fades
        const asked = getSetting("notifications_permission_asked");
        if (asked !== "true") {
          setShowPermissionModal(true);
        }
      });
    }, MIN_SPLASH_MS);

    return () => clearTimeout(timer);
  }, [allReady]);

  const handleAcceptNotifications = async () => {
    setShowPermissionModal(false);
    setSetting("notifications_permission_asked", "true");
    await requestNotificationPermissions();
  };

  const handleDismissNotifications = () => {
    setShowPermissionModal(false);
    setSetting("notifications_permission_asked", "true");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <StatusBar style="light" />
      {showApp && <AppNavigator />}
      {!showApp && (
        <Animated.View
          style={[styles.splashOverlay, { opacity: splashOpacity }]}
          pointerEvents={showApp ? "none" : "auto"}
        >
          <LoadingScreen />
        </Animated.View>
      )}
      <NotificationPermissionModal
        visible={showPermissionModal}
        onAccept={handleAcceptNotifications}
        onDismiss={handleDismissNotifications}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bgPrimary,
    zIndex: 10,
  },
});
