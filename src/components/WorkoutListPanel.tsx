import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  StyleSheet,
} from "react-native";
import { Pencil, Trash2 } from "lucide-react-native";
import type { Workout } from "../types";
import { colors, spacing, typography } from "../theme";

const ROW_HEIGHT = 56;
const SLICE_COUNT = 5;
const SLICE_HEIGHT = ROW_HEIGHT / SLICE_COUNT;

interface WorkoutListPanelProps {
  workouts: Workout[];
  selectedWorkoutId: number | null;
  onSelect: (id: number) => void;
  onEdit: (workout: Workout) => void;
  onDelete: (id: number) => void;
  onNew: () => void;
}

function GlitchDeleteRow({
  workout,
  isSelected,
  isLast,
  onSelect,
  onEdit,
  onDelete,
}: {
  workout: Workout;
  isSelected: boolean;
  isLast: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const sliceAnims = useRef(
    Array.from({ length: SLICE_COUNT }, () => ({
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;
  const rowOpacity = useRef(new Animated.Value(1)).current;

  const handleDelete = () => {
    if (isLast) return;
    setDeleting(true);

    const animations = sliceAnims.map((anim, i) => {
      const direction = i % 2 === 0 ? 1 : -1;
      const distance = (40 + Math.random() * 60) * direction;
      return Animated.parallel([
        Animated.timing(anim.translateX, {
          toValue: distance,
          duration: 400,
          delay: i * 30,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 400,
          delay: i * 30,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start(() => {
      // Collapse row height
      Animated.timing(rowOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start(() => {
        onDelete();
      });
    });
  };

  if (deleting) {
    return (
      <Animated.View style={[styles.rowOuter, { opacity: rowOpacity }]}>
        <View style={[styles.row, { height: ROW_HEIGHT, position: "relative" }]}>
          {sliceAnims.map((anim, i) => {
            const sliceColor = i % 2 === 0 ? colors.glitchCyan : colors.glitchMagenta;
            return (
              <Animated.View
                key={i}
                style={{
                  position: "absolute",
                  top: i * SLICE_HEIGHT,
                  left: 0,
                  right: 0,
                  height: SLICE_HEIGHT,
                  backgroundColor: colors.bgTertiary,
                  borderWidth: 1,
                  borderColor: sliceColor,
                  transform: [{ translateX: anim.translateX }],
                  opacity: anim.opacity,
                }}
              />
            );
          })}
        </View>
      </Animated.View>
    );
  }

  return (
    <Pressable onPress={onSelect} style={styles.rowOuter}>
      <View style={[styles.row, isSelected && styles.rowSelected]}>
        {isSelected && <View style={styles.accentBar} />}
        <View style={styles.rowContent}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          <Text style={styles.workoutMeta}>
            {workout.exerciseIds.length} exercices · {workout.rounds} round{workout.rounds > 1 ? "s" : ""}
          </Text>
        </View>
        <View style={styles.rowActions}>
          <Pressable onPress={onEdit} hitSlop={8} style={styles.iconBtn}>
            <Pencil size={16} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            hitSlop={8}
            style={[styles.iconBtn, isLast && { opacity: 0.3 }]}
          >
            <Trash2 size={16} color={isLast ? colors.textMuted : colors.accentRed} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default function WorkoutListPanel({
  workouts,
  selectedWorkoutId,
  onSelect,
  onEdit,
  onDelete,
  onNew,
}: WorkoutListPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>SÉLECTIONNER UN WORKOUT</Text>
      <ScrollView style={styles.list}>
        {workouts.map((workout) => (
          <GlitchDeleteRow
            key={workout.id}
            workout={workout}
            isSelected={workout.id === selectedWorkoutId}
            isLast={workouts.length <= 1}
            onSelect={() => onSelect(workout.id)}
            onEdit={() => onEdit(workout)}
            onDelete={() => onDelete(workout.id)}
          />
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <Pressable onPress={onNew} style={styles.newButton}>
          <Text style={styles.newButtonText}>NOUVEAU WORKOUT</Text>
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
    marginBottom: spacing.sm,
  },
  list: {
    maxHeight: 300,
  },
  rowOuter: {
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: ROW_HEIGHT,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowSelected: {
    backgroundColor: colors.bgTertiary,
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.accentBlue,
  },
  rowContent: {
    flex: 1,
  },
  workoutName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  workoutMeta: {
    ...typography.monoSm,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  newButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: "center",
  },
  newButtonText: {
    ...typography.heading,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
