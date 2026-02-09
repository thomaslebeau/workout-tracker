import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Check, Minus, Plus, ChevronUp, ChevronDown } from "lucide-react-native";
import type { Exercise, Workout } from "../types";
import { colors, spacing, typography } from "../theme";

interface WorkoutEditPanelProps {
  workout?: Workout | null;
  defaultName: string;
  allExercises: Exercise[];
  onSave: (name: string, exerciseIds: string[], rounds: number) => void;
  onCancel: () => void;
}

export default function WorkoutEditPanel({
  workout,
  defaultName,
  allExercises,
  onSave,
  onCancel,
}: WorkoutEditPanelProps) {
  const [name, setName] = useState(workout?.name ?? defaultName);
  const [rounds, setRounds] = useState(workout?.rounds ?? 1);

  // Ordered array of selected exercise IDs
  const [orderedIds, setOrderedIds] = useState<string[]>(() => {
    if (workout?.exerciseIds) return [...workout.exerciseIds];
    return allExercises.map(e => e.id);
  });

  const selectedSet = new Set(orderedIds);

  const toggleExercise = (id: string) => {
    if (selectedSet.has(id)) {
      setOrderedIds(orderedIds.filter(eid => eid !== id));
    } else {
      setOrderedIds([...orderedIds, id]);
    }
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...orderedIds];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setOrderedIds(next);
  };

  const moveDown = (index: number) => {
    if (index >= orderedIds.length - 1) return;
    const next = [...orderedIds];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setOrderedIds(next);
  };

  const exerciseNameMap = new Map(allExercises.map(e => [e.id, e.name]));
  const canSave = name.trim().length > 0 && orderedIds.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave(name.trim(), orderedIds, rounds);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {workout ? "MODIFIER WORKOUT" : "NOUVEAU WORKOUT"}
      </Text>

      <ScrollView style={styles.scroll}>
        <View style={styles.field}>
          <Text style={styles.label}>NOM</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.textMuted}
            placeholder="Nom du workout"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>ROUNDS</Text>
          <View style={styles.stepper}>
            <Pressable
              onPress={() => setRounds(Math.max(1, rounds - 1))}
              style={styles.stepperBtn}
            >
              <Minus size={18} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.stepperValue}>{rounds}</Text>
            <Pressable
              onPress={() => setRounds(rounds + 1)}
              style={styles.stepperBtn}
            >
              <Plus size={18} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>EXERCICES</Text>
          {allExercises.map((exercise) => {
            const checked = selectedSet.has(exercise.id);
            return (
              <Pressable
                key={exercise.id}
                onPress={() => toggleExercise(exercise.id)}
                style={styles.checkRow}
              >
                <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                  {checked && <Check size={14} color={colors.bgPrimary} />}
                </View>
                <Text style={styles.checkLabel}>{exercise.name}</Text>
              </Pressable>
            );
          })}
        </View>

        {orderedIds.length > 1 && (
          <View style={styles.field}>
            <Text style={styles.label}>ORDRE</Text>
            {orderedIds.map((id, index) => (
              <View key={id} style={styles.orderRow}>
                <Text style={styles.orderIndex}>{index + 1}</Text>
                <Text style={styles.orderName}>{exerciseNameMap.get(id)}</Text>
                <View style={styles.orderArrows}>
                  <Pressable
                    onPress={() => moveUp(index)}
                    hitSlop={6}
                    style={[styles.arrowBtn, index === 0 && styles.arrowDisabled]}
                  >
                    <ChevronUp
                      size={16}
                      color={index === 0 ? colors.textMuted : colors.textPrimary}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => moveDown(index)}
                    hitSlop={6}
                    style={[styles.arrowBtn, index === orderedIds.length - 1 && styles.arrowDisabled]}
                  >
                    <ChevronDown
                      size={16}
                      color={index === orderedIds.length - 1 ? colors.textMuted : colors.textPrimary}
                    />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.buttons}>
        <Pressable onPress={onCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>ANNULER</Text>
        </Pressable>
        <Pressable
          onPress={handleSave}
          style={[styles.saveBtn, !canSave && { opacity: 0.4 }]}
          disabled={!canSave}
        >
          <Text style={styles.saveText}>SAUVEGARDER</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
  },
  header: {
    ...typography.heading,
    fontSize: 16,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  scroll: {
    maxHeight: 380,
    paddingHorizontal: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.monoSm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgTertiary,
    padding: spacing.sm + 4,
    ...typography.body,
    color: colors.textPrimary,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgTertiary,
  },
  stepperValue: {
    ...typography.heading,
    color: colors.textPrimary,
    minWidth: 32,
    textAlign: "center",
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: spacing.sm + 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.accentBlue,
    borderColor: colors.accentBlue,
  },
  checkLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderIndex: {
    ...typography.monoSm,
    color: colors.textMuted,
    width: 20,
  },
  orderName: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  orderArrows: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  buttons: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelText: {
    ...typography.heading,
    fontSize: 16,
    color: colors.textSecondary,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.accentBlue,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveText: {
    ...typography.heading,
    fontSize: 16,
    color: colors.bgPrimary,
  },
});
