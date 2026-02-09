import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronDown } from "lucide-react-native";
import type { Workout } from "../types";
import { useWorkoutStore } from "../stores/workoutStore";
import { colors, spacing, typography } from "../theme";
import BottomSheet from "./BottomSheet";
import WorkoutListPanel from "./WorkoutListPanel";
import WorkoutEditPanel from "./WorkoutEditPanel";

type SheetState =
  | { mode: "closed" }
  | { mode: "list" }
  | { mode: "edit"; workout?: Workout | null };

export default function WorkoutSelector() {
  const {
    workouts,
    selectedWorkoutId,
    allExercises,
    selectWorkout,
    createNewWorkout,
    updateExistingWorkout,
    deleteExistingWorkout,
    getNextWorkoutName,
  } = useWorkoutStore();

  const [sheet, setSheet] = useState<SheetState>({ mode: "closed" });

  const selected = workouts.find(w => w.id === selectedWorkoutId);

  const handleSelect = (id: number) => {
    selectWorkout(id);
    setSheet({ mode: "closed" });
  };

  const handleEdit = (workout: Workout) => {
    setSheet({ mode: "edit", workout });
  };

  const handleDelete = (id: number) => {
    deleteExistingWorkout(id);
  };

  const handleNew = () => {
    setSheet({ mode: "edit", workout: null });
  };

  const handleSave = (name: string, exerciseIds: string[], rounds: number) => {
    if (sheet.mode === "edit" && sheet.workout) {
      updateExistingWorkout(sheet.workout.id, name, exerciseIds, rounds);
    } else {
      createNewWorkout(name, exerciseIds, rounds);
    }
    setSheet({ mode: "list" });
  };

  const handleCancel = () => {
    setSheet({ mode: "list" });
  };

  const handleClose = () => {
    setSheet({ mode: "closed" });
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => setSheet({ mode: "list" })}
        style={({ pressed }) => [styles.selector, pressed && styles.selectorPressed]}
      >
        <View style={styles.selectorContent}>
          <Text style={styles.selectorName}>{selected?.name ?? "Workout"}</Text>
          <Text style={styles.selectorMeta}>
            {selected
              ? `${selected.exerciseIds.length} exercices · ${selected.rounds} round${selected.rounds > 1 ? "s" : ""}`
              : ""}
          </Text>
        </View>
        <ChevronDown size={20} color={colors.textSecondary} />
      </Pressable>

      <BottomSheet visible={sheet.mode !== "closed"} onClose={handleClose}>
        {sheet.mode === "list" && (
          <WorkoutListPanel
            workouts={workouts}
            selectedWorkoutId={selectedWorkoutId}
            onSelect={handleSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onNew={handleNew}
          />
        )}
        {sheet.mode === "edit" && (
          <WorkoutEditPanel
            workout={sheet.workout}
            defaultName={getNextWorkoutName()}
            allExercises={allExercises}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.sm + 4,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  selectorPressed: {
    backgroundColor: colors.bgSecondary,
  },
  selectorContent: {
    flex: 1,
  },
  selectorName: {
    ...typography.heading,
    fontSize: 18,
    color: colors.textPrimary,
  },
  selectorMeta: {
    ...typography.monoSm,
    color: colors.textMuted,
    marginTop: 2,
  },
});
