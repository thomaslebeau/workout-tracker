import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { initDatabase } from "./src/database/db";

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      try {
        initDatabase();
        setIsReady(true);
      } catch (error) {
        console.error("Database initialization failed:", error);
      }
    };

    setup();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
