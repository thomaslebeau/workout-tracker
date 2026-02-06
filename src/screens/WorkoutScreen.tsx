import React, { useEffect, useRef, useCallback } from "react";
import {
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useWorkoutStore } from "../stores/workoutStore";

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
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: roundIndex * 100,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay: roundIndex * 100,
        useNativeDriver: true,
        damping: 15,
        stiffness: 120,
        mass: 1,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.roundCard,
        isLatest && styles.latestRoundCard,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.roundTitle}>Round {roundIndex + 1}</Text>
      {exercises.map((exercise) => (
        <Animated.View key={exercise.id} style={styles.exerciseRow}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Reps"
            value={
              roundData[exercise.id] != null
                ? String(roundData[exercise.id])
                : ""
            }
            onChangeText={(value) =>
              onInputChange(roundIndex, exercise.id, value)
            }
          />
        </Animated.View>
      ))}
    </Animated.View>
  );
}

export default function WorkoutScreen() {
  const {
    exercises,
    currentSession,
    loadExercises,
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
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }).start();
    }, [])
  );

  useEffect(() => {
    loadExercises();
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
    <ScrollView ref={scrollViewRef} style={styles.container}>
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
        <Button title="Next Round" onPress={handleNextRound} />
        <Button
          title="Finish Workout"
          onPress={() => {
            const xp = finishWorkout();
            Alert.alert("Workout complete!", `You earned +${xp} XP!`);
          }}
          color="green"
        />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  roundCard: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  latestRoundCard: {
    borderColor: "#4a90e2",
    borderWidth: 2,
  },
  roundTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 4,
    fontSize: 16,
    width: 80,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 40,
    gap: 10,
  },
});
