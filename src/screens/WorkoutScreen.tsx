import React, { useEffect, useRef, useCallback } from "react";
import {
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useWorkoutStore } from "../stores/workoutStore";
import { colors, spacing, typography } from "../theme";
import SystemCard from "../components/SystemCard";
import SystemButton from "../components/SystemButton";
import WorkoutSelector from "../components/WorkoutSelector";

function AnimatedRoundCard({
  roundData,
  roundIndex,
  isLatest,
  exercises,
  onInputChange,
}: {
  roundData: { [exerciseId: string]: number };
  roundIndex: number;
  isLatest: boolean;
  exercises: { id: string; name: string }[];
  onInputChange: (roundIndex: number, exerciseId: string, value: string) => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        delay: roundIndex === 0 ? 0 : 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 200,
        delay: roundIndex === 0 ? 0 : 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      <SystemCard
        style={[
          styles.roundCard,
          isLatest && styles.latestRoundCard,
        ]}
      >
        <Text style={styles.roundTitle}>ROUND {roundIndex + 1}</Text>
        {exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseRow}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              value={
                roundData[exercise.id] != null
                  ? String(roundData[exercise.id])
                  : ""
              }
              onChangeText={(value) =>
                onInputChange(roundIndex, exercise.id, value)
              }
            />
          </View>
        ))}
      </SystemCard>
    </Animated.View>
  );
}

export default function WorkoutScreen() {
  const {
    exercises,
    currentSession,
    loadWorkouts,
    startNewRound,
    saveRoundData,
    finishWorkout,
  } = useWorkoutStore();

  const scrollViewRef = useRef<ScrollView>(null);
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      buttonsOpacity.setValue(0);
      Animated.timing(buttonsOpacity, {
        toValue: 1,
        duration: 200,
        delay: 100,
        useNativeDriver: true,
      }).start();
    }, [])
  );

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleInputChange = (
    roundIndex: number,
    exerciseId: string,
    value: string
  ) => {
    const reps = parseInt(value) || 0;
    saveRoundData(roundIndex, exerciseId, reps);
  };

  const handleNextRound = () => {
    startNewRound();
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <WorkoutSelector />
      {currentSession.rounds.map((roundData, roundIndex) => {
        const isLatest = roundIndex === currentSession.currentRound;
        return (
          <AnimatedRoundCard
            key={roundIndex}
            roundData={roundData}
            roundIndex={roundIndex}
            isLatest={isLatest}
            exercises={exercises}
            onInputChange={handleInputChange}
          />
        );
      })}
      <Animated.View style={[styles.buttonContainer, { opacity: buttonsOpacity }]}>
        <SystemButton title="ROUND SUIVANT" onPress={handleNextRound} variant="ghost" />
        <SystemButton
          title="TERMINER"
          onPress={() => {
            const xp = finishWorkout();
            Alert.alert("SESSION ENREGISTRÉE", `+${xp} XP ACQUIS`);
          }}
          variant="primary"
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
  roundCard: {
    marginBottom: spacing.sm + 4,
  },
  latestRoundCard: {
    borderColor: colors.borderActive,
  },
  roundTitle: {
    ...typography.heading,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  exerciseName: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    padding: spacing.sm,
    width: 80,
    textAlign: "right",
    ...typography.mono,
    color: colors.textPrimary,
  },
  buttonContainer: {
    marginTop: spacing.md,
    gap: spacing.sm + 4,
  },
});
