import React, { useCallback, useRef, useState } from "react";
import { Text, View, StyleSheet, Alert, Animated, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useWorkoutStore } from "../stores/workoutStore";
import { getXPProgress } from "../utils/leveling";
import { colors, spacing, typography } from "../theme";
import SystemCard from "../components/SystemCard";
import SystemButton from "../components/SystemButton";
import GlitchText from "../components/GlitchText";
import ScheduleManager from "../components/ScheduleManager";
import ExerciseManager from "../components/ExerciseManager";

export default function ProfileScreen() {
  const { userProfile, loadUserProfile, loadExercises, resetUserProfile } = useWorkoutStore();
  const [glitchTrigger, setGlitchTrigger] = useState(0);

  const levelOpacity = useRef(new Animated.Value(0)).current;
  const levelTranslateX = useRef(new Animated.Value(-8)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const statsTranslateX = useRef(new Animated.Value(-8)).current;
  const resetOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
      loadExercises();

      // Reset
      levelOpacity.setValue(0);
      levelTranslateX.setValue(-8);
      statsOpacity.setValue(0);
      statsTranslateX.setValue(-8);
      resetOpacity.setValue(0);
      progressWidth.setValue(0);

      // Level card
      Animated.parallel([
        Animated.timing(levelOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(levelTranslateX, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();

      // Stats card
      Animated.parallel([
        Animated.timing(statsOpacity, {
          toValue: 1,
          duration: 200,
          delay: 100,
          useNativeDriver: false,
        }),
        Animated.timing(statsTranslateX, {
          toValue: 0,
          duration: 200,
          delay: 100,
          useNativeDriver: false,
        }),
      ]).start();

      // Reset button
      Animated.timing(resetOpacity, {
        toValue: 1,
        duration: 200,
        delay: 200,
        useNativeDriver: false,
      }).start();

      // Trigger level glitch on focus
      setGlitchTrigger((t) => t + 1);
    }, [])
  );

  const progress = userProfile
    ? getXPProgress(userProfile.experiencePoints, userProfile.currentLevel)
    : null;

  React.useEffect(() => {
    if (progress) {
      Animated.timing(progressWidth, {
        toValue: progress.percentage,
        duration: 400,
        delay: 200,
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
        <Text style={styles.loadingText}>INITIALIZING...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View
        style={{
          opacity: levelOpacity,
          transform: [{ translateX: levelTranslateX }],
        }}
      >
        <SystemCard style={styles.levelCard}>
          <Text style={styles.levelLabel}>PLAYER LEVEL</Text>
          <GlitchText
            style={styles.levelNumber}
            trigger={glitchTrigger}
            idleGlitch
          >
            {String(userProfile.currentLevel)}
          </GlitchText>
          <View style={styles.xpRow}>
            <Text style={styles.xpText}>
              {progress.current} / {progress.required}
            </Text>
            <Text style={styles.xpLabel}>XP</Text>
          </View>
          <View style={styles.xpBarTrack}>
            <Animated.View
              style={[styles.xpBarFill, { width: progressBarWidth }]}
            />
          </View>
        </SystemCard>
      </Animated.View>

      <Animated.View
        style={{
          opacity: statsOpacity,
          transform: [{ translateX: statsTranslateX }],
        }}
      >
        <SystemCard style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>TOTAL VOLUME</Text>
            <Text style={styles.statValue}>{userProfile.totalVolume}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>TOTAL XP</Text>
            <Text style={styles.statValue}>{userProfile.experiencePoints}</Text>
          </View>
        </SystemCard>
      </Animated.View>

      <ScheduleManager />

      <ExerciseManager />

      <Animated.View style={{ opacity: resetOpacity, marginTop: spacing.lg }}>
        <SystemButton
          title="Reset Progress"
          onPress={() => {
            Alert.alert(
              "SYSTEM RESET",
              "All progress will be permanently erased. This cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Reset",
                  style: "destructive",
                  onPress: resetUserProfile,
                },
              ]
            );
          }}
          variant="destructive"
        />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xxl,
  },
  levelCard: {
    marginBottom: spacing.md,
  },
  levelLabel: {
    ...typography.monoSm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  levelNumber: {
    ...typography.displayLg,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  xpRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  xpText: {
    ...typography.mono,
    color: colors.textSecondary,
  },
  xpLabel: {
    ...typography.monoSm,
    color: colors.textMuted,
  },
  xpBarTrack: {
    height: 6,
    backgroundColor: colors.xpBarTrack,
    overflow: "hidden",
  },
  xpBarFill: {
    height: "100%",
    backgroundColor: colors.xpBarFill,
  },
  statsCard: {
    marginBottom: spacing.sm,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  statLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statValue: {
    ...typography.mono,
    color: colors.textPrimary,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
