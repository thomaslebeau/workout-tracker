import React, { useCallback, useRef } from "react";
import { Text, View, StyleSheet, Button, Alert, Animated } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useWorkoutStore } from "../stores/workoutStore";
import { getXPProgress } from "../utils/leveling";

export default function ProfileScreen() {
  const { userProfile, loadUserProfile, resetUserProfile } = useWorkoutStore();

  const levelCardOpacity = useRef(new Animated.Value(0)).current;
  const levelCardTranslateY = useRef(new Animated.Value(30)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const statsTranslateY = useRef(new Animated.Value(30)).current;
  const resetOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();

      // Reset
      levelCardOpacity.setValue(0);
      levelCardTranslateY.setValue(30);
      statsOpacity.setValue(0);
      statsTranslateY.setValue(30);
      resetOpacity.setValue(0);
      progressWidth.setValue(0);

      // Level card
      Animated.parallel([
        Animated.timing(levelCardOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.spring(levelCardTranslateY, {
          toValue: 0,
          damping: 15,
          stiffness: 120,
          mass: 1,
          useNativeDriver: false,
        }),
      ]).start();

      // Stats card
      Animated.parallel([
        Animated.timing(statsOpacity, {
          toValue: 1,
          duration: 500,
          delay: 150,
          useNativeDriver: false,
        }),
        Animated.spring(statsTranslateY, {
          toValue: 0,
          delay: 150,
          damping: 15,
          stiffness: 120,
          mass: 1,
          useNativeDriver: false,
        }),
      ]).start();

      // Reset button
      Animated.timing(resetOpacity, {
        toValue: 1,
        duration: 500,
        delay: 300,
        useNativeDriver: false,
      }).start();
    }, [])
  );

  const progress = userProfile
    ? getXPProgress(userProfile.experiencePoints, userProfile.currentLevel)
    : null;

  React.useEffect(() => {
    if (progress) {
      Animated.timing(progressWidth, {
        toValue: progress.percentage,
        duration: 800,
        delay: 400,
        useNativeDriver: false,
      }).start();
    }
  }, [progress?.percentage]);

  const progressBarWidth = progressWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  if (!userProfile || !progress) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.levelCard,
          {
            opacity: levelCardOpacity,
            transform: [{ translateY: levelCardTranslateY }],
          },
        ]}
      >
        <Text style={styles.levelTitle}>Level {userProfile.currentLevel}</Text>
        <Text style={styles.xpText}>
          {progress.current} / {progress.required} XP
        </Text>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[styles.progressBar, { width: progressBarWidth }]}
          />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.statsCard,
          {
            opacity: statsOpacity,
            transform: [{ translateY: statsTranslateY }],
          },
        ]}
      >
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Volume</Text>
          <Text style={styles.statValue}>{userProfile.totalVolume} reps</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total XP</Text>
          <Text style={styles.statValue}>{userProfile.experiencePoints}</Text>
        </View>
      </Animated.View>

      <Animated.View style={[{ marginTop: 20, opacity: resetOpacity }]}>
        <Button
          title="Reset Progress"
          onPress={() => {
            Alert.alert("Reset progress", "Are you sure? All your XP and level will be lost.", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Reset",
                style: "destructive",
                onPress: resetUserProfile,
              },
            ]);
          }}
          color="red"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  levelCard: {
    backgroundColor: "#4a90e2",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  levelTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  xpText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  statsCard: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  statLabel: {
    fontSize: 16,
    color: "#666",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
